viewmodel 
package com.austin.mesax.viewmodel

import android.util.Log

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.austin.mesax.data.local.entity.CartItemWithProduct
import com.austin.mesax.data.local.entity.ProductEntity
import com.austin.mesax.data.repository.CartRepository

import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

import javax.inject.Inject

import kotlinx.coroutines.launch

//
@HiltViewModel
class CartViewModel @Inject constructor(

    private val cartRepository: CartRepository,


    ) : ViewModel() {


    private val _cartItems = MutableStateFlow<List<CartItemWithProduct>>(emptyList())
    val cartItems = _cartItems.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage = _errorMessage.asStateFlow()

    val cartCount = cartItems
        .map { list -> list.sumOf { it.cartItem.quantity } }
        .stateIn(viewModelScope, SharingStarted.Eagerly, 0)


    init {


    }

    private var syncJob: Job? = null

    fun triggerSync() {
        syncJob?.cancel()

        syncJob = viewModelScope.launch {
            delay(400) // espera o usuário parar de clicar
            cartRepository.syncAddItem()

        }
    }




    //cart
    fun addProduct(product: ProductEntity, orderId: Int) {

        viewModelScope.launch {

            cartRepository.addToCart(orderId, product)
            Log.d("CART", orderId.toString())
            triggerSync() // 🔥 não chama direto
           // syncAddItem()
        }
    }




    fun observeCart(orderId: Int?) {
        Log.d("CART_VM", "orderId recebido: $orderId")

        viewModelScope.launch {
            cartRepository.observeCart(orderId).collect {
                Log.d("CART_VM", "Recebeu: $it")
                _cartItems.value = it
            }
        }
    }


    fun increaseQuantity(item: CartItemWithProduct) {
        viewModelScope.launch {
            cartRepository.increaseQuantity(item.cartItem)
            triggerSync()
        }
    }

    fun decreaseQuantity(item: CartItemWithProduct) {
        viewModelScope.launch {
            cartRepository.decreaseQuantity(item.cartItem)
            triggerSync()
        }
    }


//    fun increaseQuantity(item: CartItemWithProduct) {
//
//        viewModelScope.launch {
//
//            val updatedCartItem = item.cartItem.copy(
//                quantity = item.cartItem.quantity + 1,
//                delta = item.cartItem.delta + 1, // 🔥 incrementa delta
//                pendingSync = true
//            )
//
//            cartRepository.updateCartItem(updatedCartItem)
//            triggerSync() // 🔥 não chama direto
//            //cartRepository.syncAddItem()
//        }
//    }
//
//    fun decreaseQuantity(item: CartItemWithProduct) {
//
//        viewModelScope.launch {
//
//            if (item.cartItem.quantity <= 1) {
//                cartRepository.deleteCartItem(item.cartItem)
//            } else {
//
//                val updated = item.cartItem.copy(
//                    quantity = item.cartItem.quantity - 1,
//                    delta = item.cartItem.delta - 1, // 🔥 incrementa delta
//                    pendingSync = true
//                )
//
//                cartRepository.updateCartItem(updated)
//            }
//            triggerSync() // 🔥 não chama direto
//           // cartRepository.syncAddItem()
//        }
//    }




}


2 / cartao

package com.austin.mesax.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import androidx.room.Transaction
import com.austin.mesax.data.local.entity.CartItemEntity
import com.austin.mesax.data.local.entity.CartItemWithProduct
import com.austin.mesax.data.local.entity.ProductEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface CartDao {

    @Transaction
    @Query("""
    SELECT * FROM cart_items
    WHERE orderId = :orderId
""")
    fun getCart(orderId: Int?): Flow<List<CartItemWithProduct>>

    @Query("""
        SELECT * FROM cart_items
        WHERE orderId = :orderId AND productId = :productId
        LIMIT 1
    """)
    suspend fun getItem(
        orderId: Int,
        productId: Int
    ): CartItemEntity?


    //@Insert(onConflict = OnConflictStrategy.REPLACE)
    //    suspend fun insert(item: CartItemEntity)
    // Muda para IGNORE — quem gerencia conflito é a lógica, não o Room
    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(item: CartItemEntity): Long  // retorna -1 se ignorou

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertProduct(product: ProductEntity)

    @Query("""
        UPDATE products 
        SET stock = stock - 1 
        WHERE id = :productId AND stock > 0
    """)
    suspend fun decrementStock(productId: Int): Int


    @Query("""
    UPDATE products 
    SET stock = stock + 1
    WHERE id = :productId
""")
    suspend fun incrementStock(productId: Int)

    @Query("""
    UPDATE cart_items
    SET quantity = quantity - 1,
        pendingSync = 1
    WHERE id = :itemId
""")
    suspend fun decrementQuantity(itemId: Int)

    @Query("""
    DELETE FROM cart_items
    WHERE id = :itemId
""")
    suspend fun deleteItem(itemId: Int)

    @Update
    suspend fun updateProduct(product: ProductEntity)

    @Query("""
    SELECT * FROM products
    WHERE id = :productId
    LIMIT 1
""")
    suspend fun getProductById(productId: Int): ProductEntity?

    @Update
    suspend fun update(item: CartItemEntity)

    @Query("""
        DELETE FROM cart_items
        WHERE orderId = :orderId
    """)
    suspend fun clearCart(orderId: Int)


    @Query("""
        SELECT * FROM cart_items
        WHERE pendingSync = 1
    """)
    suspend fun getPendingItems(): List<CartItemEntity>

    @Transaction
    suspend fun addToCartTransaction(orderId: Int, product: ProductEntity) {
        // 1. Garante que o produto existe na base local (necessário para FK)
        insertProduct(product)

        // 2. Tenta decrementar o estoque atomicamente
        val rowsAffected = decrementStock(product.id)

        if (rowsAffected == 0) {
            // Se nenhuma linha foi afetada, o estoque já era 0 (ou o produto sumiu)
            throw Exception("Produto sem estoque ou indisponível")
        }

        // 3. Gerencia o item no carrinho
        val existingItem = getItem(orderId, product.id)

        //val updated = existingItem.copy(
        //    quantity = existingItem.quantity + 1,
        //    delta = existingItem.delta + 1,
        //    pendingSync = true
        //)
        if (existingItem != null) {
            update(existingItem.copy(
                quantity = existingItem.quantity + 1,
                delta = existingItem.delta + 1,
                pendingSync = true
            ))
        } else {
            insert(CartItemEntity(
                orderId = orderId,
                productId = product.id,
                quantity = 1,
                delta = 1, // 🔥 ESSENCIAL
                pendingSync = true
            ))
        }
    }


    @Transaction
    suspend fun increaseQuantityTransaction(item: CartItemEntity) {

        val rowsAffected = decrementStock(item.productId)

        if (rowsAffected == 0) {
            throw Exception("Produto sem estoque")
        }

        update(
            item.copy(
                quantity = item.quantity + 1,
                delta = item.delta + 1,
                pendingSync = true
            )
        )
    }



    @Transaction
    suspend fun decreaseQuantityTransaction(item: CartItemEntity) {

        val newQuantity = item.quantity - 1

        if (newQuantity <= 0) {
            deleteItem(item.id)
        } else {
            update(
                item.copy(
                    quantity = newQuantity,
                    delta = item.delta - 1,
                    pendingSync = true
                )
            )
        }

        incrementStock(item.productId)
    }
}
