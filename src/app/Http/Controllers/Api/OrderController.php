<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\OrderResource;
use App\Http\Resources\SalesResource;
use App\Models\Refunds;
use Illuminate\Http\Request;
use App\Models\Orders;
use App\Http\Controllers\Controller;
use App\Models\Shifts;
use App\Models\OrderItem;
use App\Models\Payments;
use App\Models\Product;
use App\Models\Tables;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class OrderController extends Controller
{
    /**
     * 🟢 Abrir Mesa (Criar Pedido)
     */
    public function open(Request $request)
    {

        $request->validate([
            'table_id' => 'required|exists:tables,id'
        ]);




        $user = Auth::user();
        $userId = $user->id;


        // Verificar turno aberto
        $shift = Shifts::where('user_id', $userId)
            ->where('status', 'open')
            ->first();

        if (!$shift) {
            return response()->json([
                'message' => 'Abra um caixa antes de abrir uma mesa.'
            ], 403);
        }



        $table = Tables::where('id', $request->table_id)
            ->first();



        //dd($table);

        // Verificar se mesa já está ocupada
        $tableBusy = Orders::where('table_id', $table->id)
            ->where('status', 'open')
            ->exists();

        if ($tableBusy) {
            return response()->json([
                'message' => 'Mesa já está aberta.'
            ], 400);
        }

        $table->update([
            'status' => 'busy'
        ]);

        $order = Orders::create([
            'user_id' => $userId,
            'shift_id' => $shift->id,
            'table_id' => $table->id,
            'status' => 'open',
            'total' => 0,
            'opened_at' => now()
        ]);

        return response()->json($order);
    }



    public function getOrders()
    {

        $user = Auth::user();
        $orders = Orders::with('items.product', 'tables')->get();

        return OrderResource::collection($orders);

    }



    // public function getSales()
    // {


    //     $orders = Orders::with('items.product', 'tables', 'payments', 'shift', 'refunds', 'user')->paginate(2);

    //     return SalesResource::collection($orders);

    // }

    public function getSales(Request $request)
    {
        $query = Orders::with(
            'items.product',
            'tables',
            'payments',
            'shift',
            'refunds',
            'user'
        );

        // STATUS
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // MÉTODO PAGAMENTO
        // if ($request->filled('method')) {
        //     $query->whereHas('payments', function ($q) use ($request) {
        //         $q->where('method', $request->method);
        //     });
        // }

        // PESQUISA
        if ($request->filled('search')) {

            $search = $request->search;

            $query->where(function ($q) use ($search) {

                // ID pedido
                $q->where('id', 'like', "%{$search}%")

                    // nome utilizador
                    ->orWhereHas('user', function ($u) use ($search) {
                        $u->where('name', 'like', "%{$search}%");
                    })

                    // mesa
                    ->orWhereHas('tables', function ($t) use ($search) {
                        $t->where('number', 'like', "%{$search}%");
                    })

                    // produtos
                    ->orWhereHas('items.product', function ($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $orders = $query
            ->latest()
            ->paginate($request->per_page ?? 10);

        return SalesResource::collection($orders);
    }

    /**
     * ➕ Adicionar Produto
     */
    public function addItem(Request $request, $orderId)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        DB::beginTransaction();

        try {
            $order = Orders::where('id', $orderId)
                ->where('status', 'open')
                ->lockForUpdate()
                ->firstOrFail();

            $product = Product::where('id', $request->product_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($product->stock < $request->quantity) {
                DB::rollBack();
                return response()->json(['message' => 'Estoque insuficiente.'], 400);
            }

            $item = OrderItem::where('order_id', $order->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            if ($item) {
                $newQty = $item->quantity + $request->quantity;
                $subtotal = $newQty * $item->unit_price;
                $ivaAmount = $subtotal * ($item->iva_rate / 100); // ✅ usa IVA do item

                $item->update([
                    'quantity' => $newQty,
                    'subtotal' => $subtotal,
                    'iva_amount' => $ivaAmount,
                    'total_with_iva' => $subtotal + $ivaAmount,
                ]);

            } else {
                $subtotal = $product->price * $request->quantity;
                $ivaRate = $product->iva; // ex: 14 ou 7
                $ivaAmount = $subtotal * ($ivaRate / 100); // ✅ IVA correto por produto

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $request->quantity,
                    'unit_price' => $product->price,
                    'iva_rate' => $ivaRate,
                    'iva_amount' => $ivaAmount,
                    'subtotal' => $subtotal,
                    'total_with_iva' => $subtotal + $ivaAmount,
                ]);
            }

            $product->decrement('stock', $request->quantity);

            // ✅ recalcula totais somando IVA de cada item individualmente
            $subtotalGeral = $order->items()->sum('subtotal');
            $ivaGeral = $order->items()->sum('iva_amount');
            $totalGeral = $subtotalGeral + $ivaGeral;

            $order->update([
                'subtotal' => $subtotalGeral,
                'iva' => $ivaGeral,
                'total' => $totalGeral,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Produto adicionado com sucesso.',
                'resumo' => [
                    'subtotal' => $subtotalGeral,
                    'iva' => $ivaGeral,
                    'total' => $totalGeral,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



    /**
     * ➖ decrement Item
     */



    public function decrementItem(Request $request, $orderId)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1' // opcional, default 1
        ]);

        $quantity = $request->input('quantity', 1); // usa o que vier, ou 1

        DB::beginTransaction();

        try {
            $order = Orders::lockForUpdate()->findOrFail($orderId);
            $table = Tables::where('id', $order->table_id)->first();

            $item = OrderItem::where('order_id', $orderId)
                ->where('product_id', $request->product_id)
                ->lockForUpdate()
                ->firstOrFail();

            $product = Product::lockForUpdate()->findOrFail($item->product_id);

            if ($item->quantity > $quantity) {
                $item->decrement('quantity', $quantity);
                $item->update([
                    'subtotal' => $item->quantity * $item->unit_price
                ]);
            } else {
                // remove o item e devolve o que ainda estava
                $quantity = $item->quantity; // devolve só o que existe
                $item->delete();

                if ($order->items()->count() === 0) {
                    $order->delete();
                    $table->update(['status' => 'available']);
                }
            }

            $product->increment('stock', $quantity);

            $subtotal = $order->items()->sum('subtotal');
            $iva = $subtotal * 0.14;

            $order->update([
                'subtotal' => $subtotal,
                'iva' => $iva,
                'total' => $subtotal + $iva
            ]);

            DB::commit();

            return response()->json(['message' => 'Item decrementado']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * ➖ Remover Item
     */


    public function removeItem($itemId)
    {
        DB::beginTransaction();

        try {

            $item = OrderItem::lockForUpdate()->findOrFail($itemId);

            $order = $item->order;

            if ($order->status !== 'open') {
                DB::rollBack();
                return response()->json([
                    'message' => 'Pedido já fechado.'
                ], 400);
            }

            $product = Product::lockForUpdate()->findOrFail($item->product_id);

            // 🔁 Devolve estoque
            $product->increment('stock', $item->quantity);

            $item->delete();

            $order->update([
                'total' => $order->items()->sum('subtotal')
            ]);


            DB::commit();

            return response()->json([
                'message' => 'Item removido com sucesso.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Erro ao remover item.'
            ], 500);
        }
    }

    /**
     * 🔴 Fechar Mesa (Finalizar Pedido)
     */
    public function close(Request $request, $orderId)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,card,QrCode',
            'table_id' => 'required|exists:tables,id',
            'received' => 'nullable|numeric',
            'change' => 'nullable|numeric'

        ]);

        /* $order = Orders::where('id', $orderId)
            ->where('status', 'open')
            ->firstOrFail(); */
        $table = Tables::where('id', $request->table_id)
            ->first();


        $order = Orders::where('id', $orderId)
            ->where('status', 'open')
            ->lockForUpdate()
            ->firstOrFail();

        $shift = Shifts::where('id', $order->shift_id)
            ->where('status', 'open')
            ->first();

        if (!$shift) {
            return response()->json([
                'message' => 'Turno fechado. Não é possível finalizar.'
            ], 400);
        }

        DB::beginTransaction();

        try {

            // Registrar pagamento
            Payments::create([
                'order_id' => $order->id,
                'shift_id' => $shift->id,
                //'user_id' => Auth::user()->id,
                'method' => $request->payment_method,
                'amount' => $order->total,
                'received' => $request->received,
                'change' => $request->change


                /*  'order_id' => $order->id,
            'shift_id' => $shift->id,
    'method' => $request->payment_method,
    'amount' => $order->total,
    'received' => $request->received,
    'change' => $request->change,
    'status' => 'paid' */
            ]);

            // Atualizar pedido
            $order->update([
                'status' => 'closed',
                'closed_at' => now()
            ]);

            $table->update([
                'status' => 'available'
            ]);


            DB::commit();

            return response()->json([
                'message' => 'Mesa fechada com sucesso.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erro ao fechar mesa'], 500);
        }
    }


    public function refund(Request $request, $orderId)
    {
        $request->validate([
            'reason' => 'nullable|string'
        ]);

        DB::beginTransaction();

        try {

            $order = Orders::with('items')
                ->lockForUpdate()
                ->findOrFail($orderId);

            if ($order->status !== 'closed') {
                return response()->json([
                    'message' => 'Pedido não está fechado.'
                ], 400);
            }

            $payment = Payments::where('order_id', $order->id)
                ->first();

            Refunds::create([
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'amount' => $order->total,
                'user_id' => Auth::id(),
                'type' => 'full',
                'reason' => $request->reason
            ]);

            foreach ($order->items as $item) {

                Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }

            $payment->update([
                'status' => 'refunded'
            ]);

            $order->update([
                'status' => 'refunded'
            ]);

            Tables::where('id', $order->table_id)
                ->update([
                    'status' => 'available'
                ]);

            DB::commit();

            return response()->json([
                'message' => 'Reembolso realizado.'
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function refundItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string'
        ]);

        DB::beginTransaction();

        try {
            $item = OrderItem::with('order')
                ->lockForUpdate()
                ->findOrFail($itemId);

            $order = $item->order;

            if ($order->status !== 'closed' && $order->status !== 'partial_refund') {
                return response()->json(['message' => 'Pedido não fechado'], 400);
            }

            if ($request->quantity > $item->quantity) {
                return response()->json(['message' => 'Quantidade inválida'], 400);
            }

            $product = Product::lockForUpdate()->findOrFail($item->product_id);
            $product->increment('stock', $request->quantity);

            $refundAmount = ($item->total_with_iva / $item->quantity) * $request->quantity;

            if ($request->quantity == $item->quantity) {
                $item->update([
                    'status' => 'refunded',
                    'subtotal' => 0,        // ✅ zera para o recálculo ser correto
                    'iva_amount' => 0,
                    'total_with_iva' => 0,
                ]);
            } else {
                $newQty = $item->quantity - $request->quantity;
                $subtotal = $newQty * $item->unit_price;
                $ivaAmount = $subtotal * ($item->iva_rate / 100);

                $item->update([
                    'quantity' => $newQty,
                    'subtotal' => $subtotal,
                    'iva_amount' => $ivaAmount,
                    'total_with_iva' => $subtotal + $ivaAmount,
                ]);
            }

            // ✅ busca payment corretamente
            $payment = Payments::where('order_id', $order->id)->firstOrFail();

            Refunds::create([
                'order_id' => $order->id,
                'payment_id' => $payment->id,
                'user_id' => Auth::id(),
                'amount' => $refundAmount,
                'type' => 'partial',
                'reason' => $request->reason,
            ]);

            $subtotal = $order->items()->where('status', 'active')->sum('subtotal');
            $iva = $order->items()->where('status', 'active')->sum('iva_amount');

            // ✅ detecta se tudo foi reembolsado
            $allRefunded = $order->items()->where('status', 'active')->doesntExist();

            $order->update([
                'subtotal' => $subtotal,
                'iva' => $iva,
                'total' => $subtotal + $iva,
                'status' => $allRefunded ? 'refunded' : 'partial_refund',
            ]);

            DB::commit();

            return response()->json(['message' => 'Artigo reembolsado']);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


}





