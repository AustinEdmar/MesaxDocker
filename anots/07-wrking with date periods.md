1- docker-compose run --rm composer require spatie/period

2- criar uma classe Booking que implemente o contrato Spatie\Period\Period


3 -web 

Route::get('/', function () {
   $availability = (new ScheduleAvailability())->forPeriod();

   dd($availability);
});

4 - criar uma classe ScheduleAvailability que implemente o contrato Spatie\Period\PeriodCollection


{
    // vamos criar uma propriedade para armazenar as datas e horarios disponiveis
    protected PeriodCollection $periods;


    public function __construct()
    {
        // vamos criar uma nova colecao de periodos
        $this->periods = new PeriodCollection();
        //
    }

    public function forPeriod()
    {
        // vamos adicionar um novo periodo a colecao
          $this->periods = $this->periods->add(
            // vamos criar um novo periodo
            Period::make(
                // inicio hoje
                  now()->startOfDay(),
                  // fim amanhã
                  now()->addDay()->endOfDay(),
            // precisamos de minutos para o intervalo de tempo 
                  Precision::minute(),
                  Boundaries::EXCLUDE_ALL(),
            )
          );

          // vamos cortar uma consulta desta colecao, subtraindo meio dia
        $this->periods = $this->periods->subtract( 
            Period::make( 
                Carbon::createFromTimeString('12:00'),

                Carbon::createFromTimeString('12:30'),
                Precision::minute(),
                Boundaries::EXCLUDE_END(),
            )
          );
          dd($this->periods);
    }
    
}

<!--

Esse código define a classe ScheduleAvailability, que gerencia a disponibilidade de horários através de períodos de tempo. Ele utiliza classes externas (PeriodCollection, Period, Precision, Boundaries) para manipular intervalos de tempo.

Explicação Linha por Linha
1. Definição da Classe e Propriedade
php

use Carbon\Carbon;
use Spatie\Period\Boundaries;
use Spatie\Period\Period;
use Spatie\Period\PeriodCollection;
use Spatie\Period\Precision;

class ScheduleAvailability
{
    protected PeriodCollection $periods;

A classe ScheduleAvailability é criada.
A propriedade $periods é protegida (protected) e do tipo PeriodCollection, que armazenará os períodos de disponibilidade.

2. Construtor
php

public function __construct()
{
    $this->periods = new PeriodCollection();
}
O construtor inicializa a propriedade $periods como uma nova coleção de períodos.
3. Método forPeriod()
php

public function forPeriod()
{
    $this->periods = $this->periods->add(
        Period::make(
            now()->startOfDay(),
            now()->addDay()->endOfDay(),
            Precision::minute(),
            Boundaries::EXCLUDE_ALL(),
        )
    );
Cria um novo período que começa hoje à meia-noite (startOfDay()) e termina amanhã à meia-noite (addDay()->endOfDay()).
Define a precisão do período em minutos (Precision::minute()).
Define as bordas do período como excluídas (Boundaries::EXCLUDE_ALL()).
4. Removendo um Intervalo Específico
php

$this->periods = $this->periods->subtract( 
    Period::make( 
        Carbon::createFromTimeString('12:00'),
        Carbon::createFromTimeString('12:30'),
        Precision::minute(),
        Boundaries::EXCLUDE_END(),
    )
);
Remove o período entre 12:00 e 12:30 da disponibilidade.
subtract() corta esse intervalo da coleção de períodos.
Usa EXCLUDE_END(), o que significa que 12:30 não será removido (apenas até 12:29).
5. Debug da Disponibilidade
php

dd($this->periods);
Interrompe a execução e imprime o conteúdo da $periods para depuração.
Resumo
Define um período de disponibilidade de hoje até amanhã.
Exclui o intervalo entre 12:00 e 12:30 desse período.

 -->