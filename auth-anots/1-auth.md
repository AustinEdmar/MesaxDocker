1- forgotPassword


    public function forgotPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email', // valida se existe o email
    ]);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    return $status === Password::RESET_LINK_SENT
        ? response()->json(['message' => 'Reset link sent to your email'])
        : response()->json(['message' => 'Unable to send reset link'], 400);
}

## 2 - vou customizar o email de envio do reset

Passo 1: Personalizar o e-mail de reset
Você precisa criar uma nova classe de notificação que sobrescreve o link padrão.

No terminal:


php artisan make:notification ResetPasswordNotification


### Passo 3: Editar a notificação
Edite o arquivo gerado em app/Notifications/ResetPasswordNotification.php:


namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    protected function resetUrl($notifiable)
    {
        return url("http://localhost:3000/reset-password/{$this->token}?email=" . urlencode($notifiable->getEmailForPasswordReset()));
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Reset your password')
            ->line('Click the button below to reset your password.')
            ->action('Reset Password', $this->resetUrl($notifiable))
            ->line('If you did not request a password reset, no further action is required.');
    }
}


###  Passo 3: Conectar ao modelo User
No seu User.php, adicione este método:


use App\Notifications\ResetPasswordNotification;
use Illuminate\Auth\Notifications\ResetPassword as ResetPasswordBase;

public function sendPasswordResetNotification($token)
{
    $this->notify(new ResetPasswordNotification($token));
}
Isso sobrescreve a notificação padrão e usa a sua customizada.


### 4 - Boa pergunta! Sim, você pode (e deve!) usar a URL do seu frontend que está no .env — assim você não precisa hardcodar http://localhost:3000.


1. Adicione no seu .env do Laravel:
FRONTEND_URL=http://localhost:3000
Se estiver em produção depois, você troca por:

FRONTEND_URL=https://app.seusite.com


## 2. Atualize sua ResetPasswordNotification.php:

use Illuminate\Support\Facades\Config;

protected function resetUrl($notifiable)
{
    $frontendUrl = Config::get('app.frontend_url'); // pega da config
    return "{$frontendUrl}/reset-password/{$this->token}?email=" . urlencode($notifiable->getEmailForPasswordReset());
}


##  3. Registre no config/app.php:
Adicione essa linha no final do array:

'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
Assim o Config::get('app.frontend_url') vai funcionar.



























"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'

import { useAuthStore } from '@/stores/auth'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import Autoplay from "embla-carousel-autoplay"

// Define validation schema using Zod
const resetSchema = z.object({
  email: z.string().email('Email inválido'),
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  password_confirmation: z.string().min(6, 'Confirmar senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.password === data.password_confirmation, {
  message: "As senhas não coincidem",
  path: ["password_confirmation"],
});

type ResetFormValues = z.infer<typeof resetSchema>

export default function ResetPassword() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const { resetPassword, isLoading, error, clearError } = useAuthStore()

  // Obter email e token da URL
  const emailFromUrl = searchParams.get('email') || ''
  const tokenFromUrl = searchParams.get('token') || ''
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: emailFromUrl,
      token: tokenFromUrl,
      password: '',
      password_confirmation: '',
    },
  })

  // Atualizar os valores do formulário quando os parâmetros da URL mudarem
  useEffect(() => {
    if (emailFromUrl) {
      form.setValue('email', emailFromUrl);
    }
    
    if (tokenFromUrl) {
      form.setValue('token', tokenFromUrl);
    }
  }, [emailFromUrl, tokenFromUrl, form]);

  const onSubmit = async (data: ResetFormValues) => {
    // Limpa qualquer erro anterior
    clearError()
    
    try {
      // Usa a ação de reset de senha da store
      const success = await resetPassword({
        email: data.email,
        token: data.token,
        password: data.password,
        password_confirmation: data.password_confirmation
      })
      
      if (success) {
        // Mostra mensagem de sucesso
        toast.success("Senha redefinida com sucesso", {
          description: "Redirecionando para o login...",
        })
        
        // Redireciona para o login
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (error) {
      // Os erros já são tratados na store e pelos interceptores
      console.error("Erro ao redefinir senha:", error)
    }
  }

  const plugin = React.useRef(
    Autoplay({ delay: 8000, stopOnInteraction: true })
  )

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Formulário */}
      <div className="w-full lg:w-1/2 flex flex-col p-4 md:p-6 lg:p-10 min-h-screen">
        <div className="max-w-md mx-auto w-full flex flex-col h-full">
          <div className="mb-6 flex justify-between items-center">
            {/* Logo */}
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-md"></div>
            </div>
            <Button 
              variant="ghost" 
              className="flex items-center text-gray-600"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2" size={18} />
              <span className="text-sm">Voltar</span>
            </Button>
          </div>

          <div className="w-full flex flex-col flex-grow justify-center items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Criar nova Senha</h1>
            <p className="text-gray-600 mb-6 text-center">Insira a nova senha para sua conta</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                {/* Campo de email oculto */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo de token oculto */}
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo de senha */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo de confirmação de senha */}
                <FormField
                  control={form.control}
                  name="password_confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Mostrar/ocultar senha */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(prev => !prev)}
                    className="mr-2"
                  />
                  <Label htmlFor="showPassword" className="text-sm text-gray-600">
                    Mostrar senha
                  </Label>
                </div>

                {/* Mensagem de erro */}
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Redefinir Senha"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Footer - Sempre no final */}
          <div className="mt-auto pt-6 text-xs md:text-sm text-gray-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
              <p>© 2025 MesaX</p>
              <div className="flex space-x-4">
                <Link href="/terms" className="text-blue-500 font-medium">Termos de Uso</Link>
                <Link href="/privacy" className="text-blue-500 font-medium">Política de Privacidade</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrossel de Imagens */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Carousel
          plugins={[plugin.current]}
          className="w-full h-full"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, index) => (
              <CarouselItem key={index} className="h-full">
                <div className="relative w-full h-screen">
                  <Image
                    src={`../auth.svg`}
                    alt={`Imagem do carrossel ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-30" />
                  <div className="absolute bottom-10 left-10 right-10 text-white z-10">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Título do Slide {index + 1}</h2>
                    <p className="text-sm md:text-base lg:text-lg">
                      Descrição detalhada do slide {index + 1}. Adicione seu texto personalizado aqui.
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </div>
  )
}