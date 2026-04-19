The java.io.IOException: Failed to load asset path /data/app/.../base.apk error is a known issue in Android development, often triggered when the system's ResourcesManager loses the connection to the APK's assets. This typically happens during "Apply Changes" (Hot Swap) or when an Activity is recreated with a stale context while accessing system-level services (like the Sunmi Printer).
I have applied the following fixes to your project:
1.
Fixed Splash Screen Initialization: In MainActivity.kt, installSplashScreen() was being called after super.onCreate(). This is a common cause of resource loading issues. It has been moved to the very first line of onCreate.
2.
Used Application Context for Printer: I updated MainActivity.kt and CartScreen.kt to pass applicationContext to the SunmiPrinter. Using a long-lived application context prevents the printer service from holding onto an Activity context that might become invalid, which often leads to the base.apk loading error.
3.
Standardized SDK Versions: Your build.gradle.kts was targeting API 36 (Android 16/Preview). I downgraded this to API 35 (Android 15), which is the current stable target and less likely to exhibit experimental resource management bugs.

To complete the fix:
1.
Clean and Rebuild: Go to Build > Clean Project, then Build > Rebuild Project.
2.
Cold Boot: If you are using an emulator, perform a "Cold Boot". If you are using a physical device (like a Sunmi terminal), uninstall the app completely and reinstall it from scratch. This clears the cached asset paths in the OS that were causing the IOException.
3.
Avoid "Apply Changes": When working with libraries that bind to background services (like the printer), prefer a full "Run" (Shift+F10) over "Apply Changes" to ensure the APK asset path is correctly refreshed.






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


    //  Route::patch('/users/{user}', [AuthController::class, 'updateUser']); ok

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
