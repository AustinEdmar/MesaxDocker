<?php

use App\Events\PublicMessage;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\ShiftsController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;


Route::get('/teste', function () {
    return 'teste';
});

// Rota para enviar mensagens
Route::post('/send-message', function (Request $request) {
    $validated = $request->validate([
        'user' => 'sometimes|string|max:255',
        'message' => 'required|string|max:1000',
    ]);

    $user = $validated['user'] ?? 'Usuário Anônimo';
    $message = $validated['message'];

    event(new PublicMessage($user, $message));

    return response()->json(['status' => 'Mensagem enviada']);
});

// Auth (público)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Users
    Route::get('/users', [AuthController::class, 'index']);
    Route::put('/users/{user}', [AuthController::class, 'update']);

    // Tables
    Route::get('/tables', [TableController::class, 'index']);
    Route::post('/tables', [TableController::class, 'store']);
    Route::get('/tables/{table}', [TableController::class, 'show']);
    Route::put('/tables/{table}', [TableController::class, 'update']);
    Route::delete('/tables/{table}', [TableController::class, 'destroy']);

    // Shifts
    Route::get('/shifts/current', [ShiftsController::class, 'current']);
    Route::post('/shifts/open', [ShiftsController::class, 'open']);
    Route::post('/shifts/close', [ShiftsController::class, 'close']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::post('/products', [ProductController::class, 'store']);
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Orders
    Route::get('/orders', [OrderController::class, 'getOrders']);
    Route::post('/orders/open', [OrderController::class, 'open']);
    Route::post('/orders/{id}/add-item', [OrderController::class, 'addItem']);
    Route::post('/orders/{id}/decrement-item', [OrderController::class, 'decrementItem']);
    Route::delete('/orders/item/{id}', [OrderController::class, 'removeItem']);
    Route::post('/orders/{id}/close', [OrderController::class, 'close']);

    // Admin
    Route::middleware('access.level:1')->group(function () {
        Route::get('/admin/users', [AuthController::class, 'listUsers']);
        Route::put('/admin/users/{user}', [AuthController::class, 'updateUser']);
    });
});