1- a parte dos agendamentos

docker-compose run --rm artisan make:model Appointment -mf 

public function up(): void
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid'); // para identificarmos o agendamento
            $table->foreignId('service_id')->constrained(); // para saber o serviço reservado
            $table->foreignId('employee_id')->constrained(); // para saber o funcionário com quem esta servando 
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->timestamp('canceled_at')->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
           
            $table->timestamps();
        });
    }


2- vamos na factory para criar os agendamentos
class AppointmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->firstName(),
            'email' => fake()->email(),
        ];
    }

3/ model casts

class Appointment extends Model
{
    /** @use HasFactory<\Database\Factories\AppointmentFactory> */
    use HasFactory;


    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime'
        
    ];

    protected $guarded = [];


<!-- static::creating(function (Appointment $appointment) {
O método creating define um evento de modelo que será executado antes de um novo registro ser salvo no banco de dados.
Sempre que um Appointment estiver sendo criado (creating), esse código será executado.

 -->
    public static function booted() { // override the boot function

        static::creating(function (Appointment $appointment) {
            $appointment->uuid = str()->uuid();
            <!--  -->
            
        });

    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}

4 / addicionei no model employee

public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

