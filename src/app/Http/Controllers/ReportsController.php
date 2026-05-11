<?php

namespace App\Http\Controllers;

use App\Models\Orders;
use Illuminate\Http\Request;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $query = Orders::with(['items.product', 'tables', 'payments', 'user', 'shift.user']);

        // Filtro por status da ordem (paid, refunded, open, cancelled...)
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por status da cozinha
        if ($request->filled('kitchen_status')) {
            $query->where('kitchen_status', $request->kitchen_status);
        }

        // Filtro por mesa
        if ($request->filled('table_id')) {
            $query->where('table_id', $request->table_id);
        }

        // Filtro por utilizador/operador
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filtro por turno
        if ($request->filled('shift_id')) {
            $query->where('shift_id', $request->shift_id);
        }

        // Filtro por método de pagamento (cash, card...)
        if ($request->filled('payment_method')) {
            $query->whereHas('payments', function ($q) use ($request) {
                $q->where('method', $request->payment_method);
            });
        }

        // Filtro por intervalo de datas (opened_at)
        if ($request->filled('date_from')) {
            $query->whereDate('opened_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('opened_at', '<=', $request->date_to);
        }

        // Pesquisa geral: por ID da ordem ou nome do produto
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                    ->orWhereHas('items.product', function ($q2) use ($search) {
                        $q2->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('user', function ($q3) use ($search) {
                        $q3->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Ordenação dinâmica
        $sortBy = $request->get('sort_by', 'opened_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $allowedSorts = ['id', 'opened_at', 'closed_at', 'total', 'status'];

        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        // Totais agregados para o relatório (antes de paginar)
        $totals = (clone $query)->selectRaw('
            COUNT(*) as total_orders,
            SUM(total) as total_revenue,
            SUM(iva) as total_iva,
            SUM(subtotal) as total_subtotal,
            SUM(discount) as total_discount
        ')->first();

        $perPage = $request->get('per_page', 10);
        $sales = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'totals' => $totals,
            'data' => $sales,
        ]);
    }
}