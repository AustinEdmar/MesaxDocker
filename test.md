package com.austin.mesax.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.austin.mesax.data.model.UiStates.AuthUiState
import com.austin.mesax.data.model.UiStates.UserUiState
import com.austin.mesax.navigation.Screens
import com.austin.mesax.screens.home.components.ScreenScaffold
import com.austin.mesax.viewmodel.AuthViewModel
import com.austin.mesax.viewmodel.HomeViewModel
import com.austin.mesax.viewmodel.OrderViewModel
import com.austin.mesax.viewmodel.ShiftViewModel


@Composable
fun OrdersScreen(
    navController: NavHostController,
    modifier: Modifier = Modifier,
    onProfileClick: () -> Unit,
    AuthviewModel: AuthViewModel = hiltViewModel(),
    HomeViewModel: HomeViewModel = hiltViewModel(),
    shiftViewModel: ShiftViewModel = hiltViewModel(),
    orderViewModel: OrderViewModel = hiltViewModel(),

) {
    val uiState = AuthviewModel.uiState
    val shift by shiftViewModel.shift.collectAsState()
    //val userTotalSales by orderViewModel.userTotalSales.collectAsState()
    val orders by orderViewModel.orders.collectAsState()


    LaunchedEffect(uiState) {
        if (uiState is AuthUiState.Unauthenticated) {
            navController.navigate(Screens.Login.route) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    LaunchedEffect(Unit) {
        shift?.userId?.let {
            orderViewModel.getOrderByUser(it)
        }
    }

    val isLoading = uiState is AuthUiState.Loading



    ScreenScaffold(
        title = "Caixa: ${shift?.userName ?: "Nenhum"}",
        amountTitle = if (shift?.status == "open") {
            "Maneio: ${shift?.initialAmount ?: 0.0} kz"
        } else {
            "0.0 kz"
        },
        showMenu = true,
        showCart = true,
        showProfile = false,
        onProfileClick = onProfileClick,
        navController = navController, // 👈

    ) {


        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp)
        ) {

            items(orders) { order ->

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(4.dp)
                ) {

                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {

                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {

                            Text(
                                text = "Order #${order.id}",
                                fontWeight = FontWeight.Bold
                            )

                            Text(
                                text = order.status,
                                color = Color(0xFF4CAF50)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "Mesa: ${order.table_id}",
                            color = Color.Gray
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Divider()

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {

                            Text("Subtotal")

                            Text(
                                text = "${order.subtotal} kz",
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Row(
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {

                            Text("Total")

                            Text(
                                text = "${order.total} kz",
                                fontWeight = FontWeight.Bold
                            )
                        }

                    }
                }
            }
        }
    }
}