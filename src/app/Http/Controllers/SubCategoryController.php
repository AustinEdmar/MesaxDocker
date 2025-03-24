<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\SubCategory;
use App\Models\TypeCategory;
use Illuminate\Http\Request;

class SubCategoryController extends Controller
{
    public function index()
    {
        $subCategories = SubCategory::with(['category', 'typeCategory'])->get();
        return view('sub_categories.index', compact('subCategories'));
    }

    public function create()
    {
        $categories = Category::all();
        $typeCategories = TypeCategory::all();
        return view('sub_categories.create', compact('categories', 'typeCategories'));
    }

    public function store(Request $request)
    {
        $request->validate([
           
            'category_id' => 'required|exists:categories,id',
            'type_category_id' => 'required|exists:type_categories,id',
        ]);

        SubCategory::create($request->all());

        return redirect()->route('sub_categories.index')->with('success', 'Subcategoria adicionada com sucesso!');
    }

    public function edit(SubCategory $subCategory)
    {
        $categories = Category::all();
        $typeCategories = TypeCategory::all();
        return view('sub_categories.edit', compact('subCategory', 'categories', 'typeCategories'));
    }

    public function update(Request $request, SubCategory $subCategory)
    {
        $request->validate([
           
            'category_id' => 'required|exists:categories,id',
            'type_category_id' => 'required|exists:type_categories,id',
        ]);

        $subCategory->update($request->all());

        return redirect()->route('sub_categories.index')->with('success', 'Subcategoria atualizada com sucesso!');
    }
    public function show(SubCategory $subCategory)
{
    // Carrega a subcategoria com as relações necessárias
    $subCategory->load('category', 'typeCategory');

    // Retorna a view com os dados da subcategoria
    return view('sub_categories.show', compact('subCategory'));
}

    public function destroy(SubCategory $subCategory)
    {
        $subCategory->delete();
        return redirect()->route('sub_categories.index')->with('success', 'Subcategoria deletada com sucesso!');
    }
}
