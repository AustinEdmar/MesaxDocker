@component('mail::message')
# Olá, {{ $user->name ?? 'MesaX' }}

Recebemos uma solicitação para redefinir a sua senha agora.

Clique no botão abaixo para continuar :

@component('mail::button', ['url' => $url])
Redefinir Senha
@endcomponent

Se você não solicitou essa alteração, ignore este e-mail.

Atenciosamente,  
Equipe {{ config('app.name') }}
@endcomponent
