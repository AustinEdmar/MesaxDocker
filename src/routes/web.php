<?php

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
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Auth::routes();


Route::middleware(['auth'])->group(function () {
    Route::get('/', [App\Http\Controllers\HomeController::class, 'index'])->name('home');

 /*    Route::get('/tables', [TableController::class, 'index'])->name('tables.index');
    Route::get('/tables/create', [TableController::class, 'create'])->name('tables.create');
    Route::post('/tables', [TableController::class, 'store'])->name('tables.store');
    Route::get('/tables/{table}', [TableController::class, 'show'])->name('tables.show');
    Route::get('/tables/{table}/edit', [TableController::class, 'edit'])->name('tables.edit');
    Route::put('/tables/{table}', [TableController::class, 'update'])->name('tables.update');
    Route::delete('/tables/{table}', [TableController::class, 'destroy'])->name('tables.destroy');
 */

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