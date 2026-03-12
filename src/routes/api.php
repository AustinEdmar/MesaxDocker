<?php


use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\ShiftsController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;

use Illuminate\Support\Facades\Route;

/* Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum'); */

Route::get('/teste', function () {
    return 'teste';
});


//Route::get('/', [App\Http\Controllers\Api\AuthController::class, 'index']);

//Route::get('/', [AuthController::class, 'index']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);


Route::middleware('auth:sanctum')->group(function () {
    
    Route::apiResource('users', AuthController::class);
    Route::apiResource('tables', TableController::class);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    //shifts
    Route::get('/shifts/current', [ShiftsController::class, 'current']);
    Route::post('/shifts/open', [ShiftsController::class, 'open']);
    Route::post('/shifts/close', [ShiftsController::class, 'close']);
    

  //  Route::patch('/users/{user}', [AuthController::class, 'updateUser']);
    
   // Route::post('/update-user', [AuthController::class, 'updateUser']);

   //Products
   Route::apiResource('products', ProductController::class);

   //Categories
   Route::apiResource('categories', CategoryController::class);

   //Orders
   Route::post('/orders/open', [OrderController::class, 'open']);
   Route::get('/orders', [OrderController::class, 'getOrders']);
    Route::post('/orders/{id}/add-item', [OrderController::class, 'addItem']);
    Route::post('/orders/{id}/decrement-item', [OrderController::class, 'decrementItem']);
    Route::delete('/orders/item/{id}', [OrderController::class, 'removeItem']);
    Route::post('/orders/{id}/close', [OrderController::class, 'close']);

    // Admin routes
    Route::middleware('access.level:1')->group(function () {
        Route::get('/admin/users', [AuthController::class, 'listUsers']);
        Route::put('/admin/users/{user}', [AuthController::class, 'updateUser']);
    });
});
