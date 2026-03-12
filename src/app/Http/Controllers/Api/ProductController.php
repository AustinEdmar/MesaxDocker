<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    // LISTAR (com paginação)
   public function index(Request $request)
{
    $query = Product::with('category');

    // 🔹 Filtro por categoria
    if ($request->filled('category_id')) {
        $query->where('category_id', $request->category_id);
    }

    // 🔹 Busca textual
    if ($request->filled('search')) {
        $search = $request->search;

        $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('price', 'like', "%{$search}%");
        });
    }

    return ProductResource::collection(
        $query->latest()->get()
    );
}

    

    // MOSTRAR UM PRODUTO
    public function show(Product $product)
    {
        $product->load('category');

        return new ProductResource($product);
    }

    // CRIAR
    public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'price' => 'required|numeric|min:0',
        'stock' => 'required|integer|min:0',
        'category_id' => 'required|exists:categories,id',

        'image' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048'
    ]);

    // 🔥 Salva a imagem
    $imagePath = $request->file('image')
        ->store('product_images', 'public');

    $product = \App\Models\Product::create([
        'name' => $request->name,
        'description' => $request->description,
        'price' => $request->price,
        'stock' => $request->stock,
        'category_id' => $request->category_id,
        'image_path' => $imagePath
    ]);

    return new ProductResource($product);
}

    // ATUALIZAR
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($product->image_path) {
                Storage::disk('public')->delete($product->image_path);
            }

            $validated['image_path'] = $request->file('image')
                ->store('product_images', 'public');
        }

        $product->update($validated);

        return new ProductResource($product);
    }

    // DELETAR
    public function destroy(Product $product)
    {
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produto excluído com sucesso'
        ]);
    }
}