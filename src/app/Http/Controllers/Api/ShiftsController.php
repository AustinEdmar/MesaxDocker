<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Shifts;
use App\Http\Controllers\Controller;
use App\Http\Resources\ShiftResource;
use App\Models\Orders;
use App\Models\Payments;

class ShiftsController extends Controller
{
     /**
     * Abrir turno
     */
    public function open(Request $request)
    {
        $request->validate([
            'initial_amount' => 'required|numeric|min:0'
        ]);

        $user = Auth::user();

        // Verifica se já existe turno aberto
        $existingShift = Shifts::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if ($existingShift) {
            return response()->json([
                'message' => 'Já existe um turno aberto.'
            ], 400);
        }

        $shift = Shifts::create([
            'user_id' => $user->id,
            'initial_amount' => $request->initial_amount,
            'status' => 'open',
            'opened_at' => now()
        ]);


        return ShiftResource::make($shift);

        /* return response()->json([
            'message' => 'Turno aberto com sucesso.',
            'shift' => $shift
        ]); */
    }

    /**
     * Fechar turno
     */

    public function close(Request $request)
{
    // 1️⃣ Valida o valor final contado no caixa
    // O caixa precisa informar quanto dinheiro físico existe na gaveta.
    $request->validate([
        'final_cash_amount' => 'required|numeric|min:0'
    ]);

    // 2️⃣ Obtém o usuário autenticado (garçom ou caixa logado no sistema)
    $user = Auth::user();

    // 3️⃣ Procura o turno aberto desse usuário
    // Um usuário só pode ter um turno aberto por vez.
    $shift = Shifts::where('user_id', $user->id)
        ->where('status', 'open')
        ->first();

    // 4️⃣ Se não existir turno aberto, não é possível fechar
    if (!$shift) {
        return response()->json([
            'message' => 'Nenhum turno aberto encontrado.'
        ], 404);
    }

    // 5️⃣ Verifica se ainda existem pedidos abertos nesse turno
    // Não é permitido fechar o caixa se ainda houver mesas abertas.
    $openOrders = Orders::where('shift_id', $shift->id)
        ->where('status', 'open')
        ->exists();

    // 6️⃣ Se existir algum pedido aberto, bloqueia o fechamento do turno
    if ($openOrders) {
        return response()->json([
            'message' => 'Existem pedidos abertos neste turno. Feche todas as mesas antes.'
        ], 400);
    }

    // 7️⃣ Inicia uma transação no banco de dados
    // Isso garante que todas as operações aconteçam juntas.
    // Se algo falhar, tudo será revertido.
    DB::beginTransaction();

    try {

        // 8️⃣ Soma todos os pagamentos em dinheiro feitos nesse turno
        // Aqui estamos considerando apenas pagamentos com método "cash".
        $cashSales = Payments::where('shift_id', $shift->id)
            ->where('method', 'cash')
            ->sum('amount');

        // 9️⃣ Calcula quanto deveria existir no caixa
        // Fundo inicial + vendas em dinheiro.
        $expected = $shift->initial_amount + $cashSales;

        // 🔟 Calcula a diferença entre o dinheiro contado e o esperado
        // Pode dar positivo (sobra) ou negativo (falta).
        $difference = $request->final_cash_amount - $expected;

        // 1️⃣1️⃣ Atualiza os dados do turno
        // Guarda os valores finais e marca o turno como fechado.
        $shift->update([
            'expected_cash_amount' => $expected, // valor que deveria existir
            'final_cash_amount' => $request->final_cash_amount, // valor contado
            'difference' => $difference, // diferença entre esperado e contado
            'status' => 'closed', // muda status do turno para fechado
            'closed_at' => now() // registra horário de fechamento
        ]);

        // 1️⃣2️⃣ Confirma a transação no banco
        DB::commit();

        // 1️⃣3️⃣ Retorna resposta de sucesso com os valores calculados
        return response()->json([
            'message' => 'Turno fechado com sucesso.',
            'expected_cash' => $expected,
            'final_cash' => $request->final_cash_amount,
            'difference' => $difference
        ]);

    } catch (\Exception $e) {

        // 1️⃣4️⃣ Se ocorrer erro, desfaz todas as operações feitas
        DB::rollBack();

        // 1️⃣5️⃣ Retorna erro para o cliente
        return response()->json([
            'message' => 'Erro ao fechar turno.',
            'error' => $e->getMessage()
        ], 500);
    }
}
   /*  public function close(Request $request)
    {
        $request->validate([
            'final_cash_amount' => 'required|numeric|min:0'
        ]);

        $user = Auth::user();

        $shift = Shifts::where('user_id', $user->id)
            ->where('status', 'open')
            ->first();

        if (!$shift) {
            return response()->json([
                'message' => 'Nenhum turno aberto encontrado.'
            ], 404);
        }

        DB::beginTransaction();

        try {

            // Soma pagamentos em dinheiro do turno
            $cashSales = Payments::where('shift_id', $shift->id)
                ->where('method', 'cash', 'QrCode', 'BankTransfer', 'card')
                ->sum('amount');

            // Valor esperado = fundo inicial + vendas em dinheiro
            $expected = $shift->initial_amount + $cashSales;

            $difference = $request->final_cash_amount - $expected;

            $shift->update([
                'expected_cash_amount' => $expected,
                'final_cash_amount' => $request->final_cash_amount,
                'status' => 'closed',
                'closed_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Turno fechado com sucesso.',
                'expected_cash' => $expected,
                'final_cash' => $request->final_cash_amount,
                'difference' => $difference
            ]);

        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao fechar turno.',
                'error' => $e->getMessage()
            ], 500);
        }
    } */

    /**
     * Ver turno atual
     */
    public function current()
{
    $user = Auth::user();

    if (!$user) {
        return response()->json([
            'message' => 'Usuário não autenticado'
        ], 401);
    }

     $shift = Shifts::with('user') // 👈 aqui
        ->where('user_id', $user->id)
        ->where('status', 'open')
        ->first();

    

    if (!$shift) {
        return response()->json([
            'message' => 'Nenhum turno aberto.'
        ], 404);
    }


    //return  response()->json($shift);

    return ShiftResource::make($shift);
}



}
