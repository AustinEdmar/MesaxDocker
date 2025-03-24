<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TableResource;
use App\Models\Tables;
use Illuminate\Http\Request;

class TableController extends Controller
{
    public function index()
    {
        $tables = Tables::all();
        return TableResource::collection($tables);
    }

    public function store(Request $request)
    {
        $request->validate([
            'number' => 'required|unique:tables',
            'status' => 'required|in:available,reserved,busy',
        ]);

        $table = Tables::create($request->all());
        return new TableResource($table);
    }

    public function show(Tables $table)
    {
        return new TableResource($table);
    }

    public function update(Request $request, Tables $table)
    {
        $request->validate([
            'number' => 'required|unique:tables,number,' . $table->id,
            'status' => 'required|in:available,reserved,busy',
        ]);
    
        $table->update($request->all());
        return new TableResource($table);
    }

    public function destroy(Tables $table)
    {
        $table->delete();
        return response()->noContent();
    }
}
