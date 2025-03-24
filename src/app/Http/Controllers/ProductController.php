<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\SubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('subCategory')->get();

     
        return view('products.index', compact('products'));
    }

    public function create()
    {
        $categories = \App\Models\Category::with('subCategories.typeCategory')->get();

       // dd($subCategories->category_id);

        return view('products.create', compact('categories'));
    }

  // Armazena um novo produto
  public function store(Request $request)
  {
      $request->validate([
          'name' => 'required|string|max:255',
          'description' => 'required|string',
          'price' => 'required|numeric',
          'sub_category_id' => 'nullable|exists:sub_categories,id',
          'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
      ]);

      // Verifica se há uma imagem no request e faz o upload
      $imagePath = null;
      if ($request->hasFile('image')) {
          $imagePath = $request->file('image')->store('product_images', 'public'); // Salva a imagem na pasta 'product_images' dentro de 'storage/app/public'
      }

      // Criação do produto
      Product::create([
         'name' => $request->name,
          'description' => $request->description,
          'price' => $request->price,
          'sub_category_id' => $request->sub_category_id,
          'image_path' => $imagePath, // Caminho da imagem
      ]);

      return redirect()->route('products.index')->with('success', 'Produto criado com sucesso!');
  }

  public function edit(Product $product)
  {
      // Carrega todas as categorias com suas subcategorias e tipos de categoria
      $categories = \App\Models\Category::with('subCategories.typeCategory')->get();
  
      return view('products.edit', compact('product', 'categories'));
  }
  

    // Atualiza um produto existente
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'sub_category_id' => 'nullable|exists:sub_categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
    
        // Verifica se há uma nova imagem no request e faz o upload
        if ($request->hasFile('image')) {
            // Remove a imagem antiga se existir
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }
            $imagePath = $request->file('image')->store('product_images', 'public');
            $product->image_path = $imagePath;
        }
    
        // Atualiza os dados do produto
        $product->update([
            'name' => $request->name,
            'description' => $request->description,
            'price' => $request->price,
            'sub_category_id' => $request->sub_category_id,
        ]);
    
        return redirect()->route('products.index')->with('success', 'Produto atualizado com sucesso!');
    }
    

    // Exclui um produto
    public function destroy(Product $product)
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();
        return redirect()->route('products.index')->with('success', 'Produto excluído com sucesso!');
    }
}
