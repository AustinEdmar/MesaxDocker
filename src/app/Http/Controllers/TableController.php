<?php

namespace App\Http\Controllers;

use App\Models\Tables;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index()
    {
        $tables = Tables::all();
        return view('tables.index', compact('tables'));
    }

    public function create()
    {
        return view('tables.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'number' => 'required|unique:tables',
            'status' => 'required|in:available,reserved,busy',
        ]);

        $table = Tables::create($request->all());
        return redirect()->route('tables.index')->with('success', 'Table created successfully.');
    }

    public function show(Tables $table)
    {
        return view('tables.show', compact('table'));
    }

    public function edit(Tables $table)
    {
        return view('tables.edit', compact('table'));
    }

    public function update(Request $request, Tables $table)
    {
        $request->validate([
            'number' => 'required|unique:tables,number,' . $table->id,
            'status' => 'required|in:available,reserved,busy',
        ]);

        $table->update($request->all());
        return redirect()->route('tables.index')->with('success', 'Table updated successfully.');
    }

    public function destroy(Tables $table)
    {
        $table->delete();
        return redirect()->route('tables.index')->with('success', 'Table deleted successfully.');
    }
}

