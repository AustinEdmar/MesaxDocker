Objetivo

Bloquear o botão aumentar quantidade (+) quando o produto não tiver stock disponível.

1. Alterar OrderItemCard

Adicionar o parâmetro increaseEnabled

Antes:

@Composable
fun OrderItemCard(
    item: CartItem,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
)

Depois:

@Composable
fun OrderItemCard(
    item: CartItem,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    increaseEnabled: Boolean
)

Agora altere a chamada do QuantityStepperCart

Antes:

QuantityStepperCart(item.quantity, onIncrease, onDecrease)

Depois:

QuantityStepperCart(
    quantity = item.quantity,
    onIncrease = onIncrease,
    onDecrease = onDecrease,
    increaseEnabled = increaseEnabled
)
2. Alterar QuantityStepperCart

Antes:

@Composable
fun QuantityStepperCart(
    quantity: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit
)

Depois:

@Composable
fun QuantityStepperCart(
    quantity: Int,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    increaseEnabled: Boolean
)
3. Bloquear botão +

Dentro do QuantityStepperCart

Antes:

IconButton(
    onClick = onIncrease
) {
    Icon(Icons.Default.Add, contentDescription = null)
}

Depois:

IconButton(
    onClick = onIncrease,
    enabled = increaseEnabled
) {
    Icon(Icons.Default.Add, contentDescription = null)
}
4. Passar valor no CartScreen

Onde chama o OrderItemCard

Antes:

OrderItemCard(
    item = CartItem(...),
    onIncrease = {
        cartViewModel.increaseQuantity(cartItemWithProduct)
    },
    onDecrease = {
        cartViewModel.decreaseQuantity(cartItemWithProduct)
    }
)

Depois:

OrderItemCard(
    item = CartItem(...),
    onIncrease = {
        cartViewModel.increaseQuantity(cartItemWithProduct)
    },
    onDecrease = {
        cartViewModel.decreaseQuantity(cartItemWithProduct)
    },
    increaseEnabled = product.stock > 0
)
Resultado
Quando stock > 0 → botão + ativo
Quando stock = 0 → botão + bloqueado
UI reativa automaticamente
Sem exceptions
Sem crashes