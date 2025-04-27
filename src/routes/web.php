<?php

use App\Events\PublicMessage;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CuisineController;
use App\Http\Controllers\DishesCategoryController;
use App\Http\Controllers\DishesController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaucesController;
use App\Http\Controllers\SidesController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\SubCategoryController;
use App\Http\Controllers\TableController;
use App\Http\Controllers\TypeCategoryController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/chat', function () {
  return view('chat');
});



// Rota para enviar mensagens
Route::post('/send-message', function (Request $request) {
  $user = $request->input('user', 'Usuário Anônimo');
  $message = $request->input('message');
  
  event(new PublicMessage($user, $message));
  
  return response()->json(['status' => 'Mensagem enviada']);
});



Auth::routes();


Route::middleware(['auth'])->group(function () {
   // Route::get('/', [App\Http\Controllers\HomeController::class, 'index']);



 Route::resource('tables', TableController::class);
 Route::resource('category', CategoryController::class);
 Route::resource('sub_categories', SubCategoryController::class);
 Route::resource('type_categories', TypeCategoryController::class);
 Route::resource('products', ProductController::class);
 Route::resource('stocks', StockController::class);


 Route::resource('cuisines', CuisineController::class);
 Route::resource('categories', DishesCategoryController::class);
 Route::resource('subcategories', SubcategoryController::class);
 Route::resource('dishes', DishesController::class);
 Route::resource('sides', SidesController::class);
 Route::resource('sauces', SaucesController::class);
 


});