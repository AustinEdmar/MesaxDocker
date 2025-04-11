<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Config;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    protected $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    protected function resetUrl($notifiable)
{
    $frontendUrl = Config::get('app.frontend_url'); // pega da config
    return "{$frontendUrl}/reset-password/{$this->token}?email=" . urlencode($notifiable->getEmailForPasswordReset());
}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    /* public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Redefinição de senha')
            ->line('Clique no botão abaixo para redefinir sua senha.')
            ->action('Redefinir Senha', $this->resetUrl($notifiable))
            ->line('Se você não solicitou um reset de senha, nenhuma ação adicional será necessária.');
    } */

    public function toMail(object $notifiable): MailMessage
{
    return (new MailMessage)
        ->subject('Redefinição de Senha')
        ->markdown('emails.auth.reset-password', [
            'url' => $this->resetUrl($notifiable),
            'user' => $notifiable,
        ]);
}

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
