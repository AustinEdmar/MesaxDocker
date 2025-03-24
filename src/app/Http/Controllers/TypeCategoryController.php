<?php

namespace App\Http\Controllers;

use App\Models\TypeCategory;
use Illuminate\Http\Request;

class TypeCategoryController extends Controller
{
    public function index()
    {
        $typeCategories = TypeCategory::all();
        return view('type_categories.index', compact('typeCategories'));
    }

    public function create()
    {
        return view('type_categories.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|unique:type_categories,name']);
        TypeCategory::create($validated);
        return redirect()->route('type_categories.index')->with('success', 'TypeCategory created successfully');
    }

    public function edit(TypeCategory $typeCategory)
    {
        return view('type_categories.edit', compact('typeCategory'));
    }

    public function update(Request $request, TypeCategory $typeCategory)
    {
        $validated = $request->validate(['name' => 'required|unique:type_categories,name,'.$typeCategory->id]);
        $typeCategory->update($validated);
        return redirect()->route('type_categories.index')->with('success', 'TypeCategory updated successfully');
    }

    public function destroy(TypeCategory $typeCategory)
    {
        $typeCategory->delete();
        return redirect()->route('type_categories.index')->with('success', 'TypeCategory deleted successfully');
    }
}