<?php


use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TableController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/hoje', function () {
    return 'hoje';
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

  //  Route::patch('/users/{user}', [AuthController::class, 'updateUser']);
    
   // Route::post('/update-user', [AuthController::class, 'updateUser']);

    // Admin routes
    Route::middleware('access.level:1')->group(function () {
        Route::get('/admin/users', [AuthController::class, 'listUsers']);
        Route::put('/admin/users/{user}', [AuthController::class, 'updateUser']);
    });
});
