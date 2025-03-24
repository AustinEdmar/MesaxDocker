<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Product;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index()
    {
        $stocks = Stock::with('product')->get();
        return view('stocks.index', compact('stocks'));
    }

    public function create()
    {
        $products = Product::all();
        return view('stocks.create', compact('products'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'product_id' => 'required|exists:products,id',
        ]);

        Stock::create($request->all());
        return redirect()->route('stocks.index')->with('success', 'Estoque adicionado com sucesso!');
    }

    public function show(Stock $stock)
    {
        return view('stocks.show', compact('stock'));
    }

    public function edit(Stock $stock)
    {
        $products = Product::all();
        return view('stocks.edit', compact('stock', 'products'));
    }

    public function update(Request $request, Stock $stock)
    {
        $request->validate([
            'amount' => 'required|integer|min:1',
            'product_id' => 'required|exists:products,id',
        ]);

        $stock->update($request->all());
        return redirect()->route('stocks.index')->with('success', 'Estoque atualizado com sucesso!');
    }

    public function destroy(Stock $stock)
    {
        $stock->delete();
        return redirect()->route('stocks.index')->with('success', 'Estoque excluído com sucesso!');
    }
}
