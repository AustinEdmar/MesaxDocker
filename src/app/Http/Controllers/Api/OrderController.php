<?php

namespace App\Http\Controllers\Api;

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
            'table_id' => 'required|exists:tables,number'
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



        $table = Tables::where('number', $request->table_id)
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
        $orders = Orders::get();

        return response()->json($orders);
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
                return response()->json([
                    'message' => 'Estoque insuficiente.'
                ], 400);
            }

            // 🔎 verifica se item já existe no pedido
            $item = OrderItem::where('order_id', $order->id)
                ->where('product_id', $product->id)
                ->lockForUpdate()
                ->first();

            if ($item) {

                // incrementa quantidade
                $item->increment('quantity', $request->quantity);

                $item->update([
                    'subtotal' => $item->quantity * $item->unit_price
                ]);

            } else {

                // cria item novo
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $request->quantity,
                    'unit_price' => $product->price,
                    'subtotal' => $product->price * $request->quantity
                ]);
            }

            // 🔻 diminui estoque
            $product->decrement('stock', $request->quantity);

            // 🔁 recalcula total
            $subtotal = $order->items()->sum('subtotal');
            $iva = $subtotal * 0.14;
            $total = $subtotal + $iva;

            $order->update([
                'subtotal' => $subtotal,
                'iva' => $iva,
                'total' => $total
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Produto adicionado com sucesso.'
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
    }



    /**
     * ➖ decrement Item
     */
    /*  public function decrementItem($itemId)
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

             // se quantidade > 1 apenas decrementa
             if ($item->quantity > 1) {

                 $item->decrement('quantity');

                 $item->update([
                     'subtotal' => $item->quantity * $item->unit_price
                 ]);

             } else {

                 // se quantidade == 1 remove item
                 $item->delete();
             }

             // devolve estoque
             $product->increment('stock', 1);

             // recalcula total
             $subtotal = $order->items()->sum('subtotal');
             $iva = $subtotal * 0.14;
             $total = $subtotal + $iva;

             $order->update([
                 'subtotal' => $subtotal,
                 'iva' => $iva,
                 'total' => $total
             ]);

             DB::commit();

             return response()->json([
                 'message' => 'Item atualizado.'
             ]);

         } catch (\Exception $e) {

             DB::rollBack();

             return response()->json([
                 'error' => 'Erro ao atualizar item.'
             ], 500);
         }
     } */


    public function decrementItem(Request $request, $orderId)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        DB::beginTransaction();

        try {

            $order = Orders::lockForUpdate()->findOrFail($orderId);

            $item = OrderItem::where('order_id', $orderId)
                ->where('product_id', $request->product_id)
                ->lockForUpdate()
                ->firstOrFail();

            $product = Product::lockForUpdate()
                ->findOrFail($item->product_id);

            if ($item->quantity > 1) {

                $item->decrement('quantity');

                $item->update([
                    'subtotal' => $item->quantity * $item->unit_price
                ]);

            } else {
                $item->delete();
            }

            // devolve estoque
            $product->increment('stock', 1);

            // recalcula
            $subtotal = $order->items()->sum('subtotal');
            $iva = $subtotal * 0.14;
            $total = $subtotal + $iva;

            $order->update([
                'subtotal' => $subtotal,
                'iva' => $iva,
                'total' => $total
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Item decrementado'
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'error' => $e->getMessage()
            ], 500);
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
            'payment_method' => 'required|in:cash,card,QrCode,BankTransfer',
            'table_id' => 'required|exists:tables,number'
        ]);

        /* $order = Orders::where('id', $orderId)
            ->where('status', 'open')
            ->firstOrFail(); */
        $table = Tables::where('number', $request->table_id)
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
                'amount' => $order->total
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
}
