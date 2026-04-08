Você deve verificar se o carrinho ficou vazio após deletar.

Código corrigido
suspend fun syncAddItem(): String? = syncMutex.withLock {

    try {

        val items = cartDao.getPendingItems()

        items.forEach { item ->

            when {

                // 🔼 INCREMENTAR
                item.delta > 0 -> {

                    val response = api.addItem(
                        item.orderId,
                        AddItemRequest(
                            product_id = item.productId,
                            quantity = item.delta
                        )
                    )

                    if (!response.isSuccessful) {
                        return response.errorBody()?.string()
                    }
                }

                // 🔽 DECREMENTAR
                item.delta < 0 -> {

                    repeat(kotlin.math.abs(item.delta)) {

                        val response = api.decrementItem(
                            item.orderId,
                            AddItemRequest(
                                product_id = item.productId,
                                quantity = 1
                            )
                        )

                        if (!response.isSuccessful) {
                            return response.errorBody()?.string()
                        }
                    }
                }
            }

            // 🔥 pega item atualizado do banco
            val current = cartDao.getItem(
                orderId = item.orderId,
                productId = item.productId
            ) ?: return@forEach

            // 🔥 limpa depois de sincronizar
            val updated = current.copy(
                pendingSync = false,
                delta = 0
            )

            cartDao.update(updated)

            // 🔥 deleta apenas depois do sync
            if (updated.quantity == 0) {
                cartDao.deleteItem(updated.id)
                cartDao.deleteProduct(updated.productId)

                // 🔥 verifica se carrinho ficou vazio
                val remainingItems = cartDao.getAllItems()

                if (remainingItems.isEmpty()) {
                    _navigationEvent.emit(Unit)
                }
            }
        }

    } catch (e: Exception) {
        return e.message
    }

    return null
}
🔥 Você precisa deste DAO
@Query("SELECT * FROM cart_items")
suspend fun getAllItems(): List<CartItemEntity>