"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
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
import {
  Form,
  FormControl,
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
  const params = useParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { resetPassword, isLoading, error, clearError } = useAuthStore()

  // Obter token do path da URL
  const tokenFromPath = params.token as string || ''
  
  // Obter email do query parameter
  const emailFromUrl = searchParams.get('email') || ''
  
  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: emailFromUrl,
      token: tokenFromPath,
      password: '',
      password_confirmation: '',
    },
  })

  // Atualizar os valores do formulário quando os parâmetros da URL mudarem
  useEffect(() => {
    if (emailFromUrl) {
      form.setValue('email', emailFromUrl);
    }
    
    if (tokenFromPath) {
      form.setValue('token', tokenFromPath);
    }
  }, [emailFromUrl, tokenFromPath, form]);

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
    <Suspense fallback={<div>Carregando...</div>}>
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

                {/* Exibir informações de diagnóstico (remover em produção) */}
                {/* Campo de senha */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                          <Button 
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
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
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            {...field}
          />
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

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
                    src={`/auth.svg`}
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
    </Suspense>
  )
}