<?php

namespace App\Http\Controllers;

use App\Models\Cuisine;
use App\Models\Dishes;
use App\Models\DishesSubCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class DishesController extends Controller{
    public function index()
    {
        $dishes = Dishes::with(['cuisine', 'subcategory'])->paginate(10);
        return view('dishes.index', compact('dishes'));
    }

    public function create()
    {
        $cuisines = Cuisine::all();
        $subcategories = DishesSubCategory::all();
        return view('dishes.create', compact('cuisines', 'subcategories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cuisine_id' => 'required|exists:cuisines,id',
            'subcategory_id' => 'required|exists:subcategories,id',
            'name' => 'required|string|max:255',
            'original_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'spicy' => 'boolean',
            'vegetarian' => 'boolean',
            'serving_size' => 'nullable|integer|min:1',
            'allergens' => 'nullable|array',
            'image' => 'nullable|image|max:2048', // 2MB Max
        ]);

        $validated['slug'] = Str::slug($validated['name']);
        
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('dishes', 'public');
            $validated['image_path'] = $path;
        }

        $dish = Dishes::create($validated);

        if ($request->has('sides')) {
            $dish->sides()->attach($request->sides);
        }

        if ($request->has('sauces')) {
            $dish->sauces()->attach($request->sauces);
        }

        /* // Sync sides and sauces with their included_in_price status
        if ($request->has('sides')) {
            $sides = collect($request->sides)->mapWithKeys(function ($id) use ($request) {
                return [$id => ['included_in_price' => in_array($id, $request->included_sides ?? [])]];
            });
            $dish->sides()->sync($sides);
        }

        if ($request->has('sauces')) {
            $sauces = collect($request->sauces)->mapWithKeys(function ($id) use ($request) {
                return [$id => ['included_in_price' => in_array($id, $request->included_sauces ?? [])]];
            });
            $dish->sauces()->sync($sauces);
        } */

        return redirect()->route('dishes.index')
            ->with('success', 'Dish created successfully.');
    }

    public function edit(Dishes $dish)
    {
        $cuisines = Cuisine::all();
        $subcategories = DishesSubCategory::all();
        return view('dishes.edit', compact('dish', 'cuisines', 'subcategories'));
    }

    public function update(Request $request, Dishes $dish)
    {
        $validated = $request->validate([
            'cuisine_id' => 'required|exists:cuisines,id',
            'subcategory_id' => 'required|exists:subcategories,id',
            'name' => 'required|string|max:255',
            'original_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'spicy' => 'boolean',
            'vegetarian' => 'boolean',
            'serving_size' => 'nullable|integer|min:1',
            'allergens' => 'nullable|array',
            'image' => 'nullable|image|max:2048',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($dish->image_path) {
                Storage::disk('public')->delete($dish->image_path);
            }
            $path = $request->file('image')->store('dishes', 'public');
            $validated['image_path'] = $path;
        }

        $dish->update($validated);

        // Sync relationships
        if ($request->has('sides')) {
            $dish->sides()->sync($request->sides);
        }

        if ($request->has('sauces')) {
            $dish->sauces()->sync($request->sauces);
        }

        return redirect()->route('dishes.index')
            ->with('success', 'Dish updated successfully.');
    }

    public function destroy(Dishes $dish)
    {
        if ($dish->image_path) {
            Storage::disk('public')->delete($dish->image_path);
        }
        
        $dish->delete();

        return redirect()->route('dishes.index')
            ->with('success', 'Dish deleted successfully.');
    }
}
