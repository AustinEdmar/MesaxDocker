1 -depois de iterar sobre os dias, queremos determinar se o funcionario pode trabalhar nesses dias



Route::get('/', function () {

    $employee = Employee::find(1);
    $service = $employee->services->find(1);
   $availability = (new ScheduleAvailability($employee, $service))->forPeriod(
    now()->startOfDay(), 
   now()->addMonth()->endOfDay());   
}); 


2 -   protected function addAvailabilityFromSchedule(Carbon $date)
    {
     //se nao houver agendamentos, não fazemos nada
      if(!$schedule = $this->employee->schedules->where('starts_at', '<=', $date)->where('ends_at', '>=', $date)) {
        return;
      }

       dd($date->format('l')); //monday
    }


3-     public function forPeriod(Carbon $startAt, Carbon $endAt)
    {

      
      collect(CarbonPeriod::create($startAt, $endAt)->days())
          ->each(function( $date) {

            //
              $this->addAvailabilityFromSchedule($date);
      });

    }


4 - vamos criar um metodo para obter as horas de trabalho de uma data especifica, em schedule.php


04.41 