<?php


use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TableController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//Route::get('/', [App\Http\Controllers\Api\AuthController::class, 'index']);

//Route::get('/', [AuthController::class, 'index']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::apiResource('tables', TableController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/update-profile-photo', [AuthController::class, 'updateProfilePhoto']);

    // Admin routes
    Route::middleware('access.level:1')->group(function () {
        Route::get('/admin/users', [AuthController::class, 'listUsers']);
        Route::put('/admin/users/{user}', [AuthController::class, 'updateUser']);
    });
});
