1- deppos de entender como funciona o periodo de data vamos rotas web

2- ver data pedriodo durante um mes

Route::get('/', function () {
   $availability = (new ScheduleAvailability())->forPeriod(

    now()->startOfDay(),
    now()->addMonth()->endOfDay(),
    Precision::minute(),
    Boundaries::EXCLUDE_ALL()
   );

    
   //dd($availability);
});


3 -  public function forPeriod(Carbon $startAt, Carbon $endAt)
    {

      // vamos iterar sobre o periodo de datas do mes, e daqui listando todos os dias podemos extrair qual dia da semana, suganda terca, quarta etc
      //aplicamos o formal l e dara o dia
      collect(CarbonPeriod::create($startAt, $endAt)->days())
      ->each(function( $date) {
            dump($date->format('l'));
      });

    }