"use client"

import React, {  useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import Autoplay from "embla-carousel-autoplay"
import { useAuthStore } from '@/stores/auth'
import { toast } from 'sonner'
//import { initSessionTimeoutAfterLogin } from '@/lib/axios'

// Define login schema
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  phone: z.string().min(6, 'Telefone deve ter pelo menos 6 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  password_confirmation: z.string().min(6, 'Confirmar senha deve ter pelo menos 6 caracteres'),
})

// Type for form data
type RegisterFormValues = z.infer<typeof registerSchema>

export default function Register() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
 
  const { register, isLoading, clearError } = useAuthStore()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    // Limpa qualquer erro anterior
    clearError()
    
    try {
      // Usa a ação de login da store
      const success = await register(data)
      console.log(success)
      
      if (success) {
        // Inicia o temporizador de sessão
      //  initSessionTimeoutAfterLogin(router)
        
        // Mostra mensagem de sucesso
        toast.success("Cadastro realizado com sucesso", {
          description: "Redirecionando para o login...",
        })
        
        // Redireciona para o dashboard
        router.push('/login')
      }
    } catch (error) {
      // Os erros já são tratados na store e pelos interceptores
      console.log(error)
    }
  }

  const plugin = React.useRef(
    Autoplay({ delay: 8000, stopOnInteraction: true })
  )
  

  

  return (
  
    <div className="flex flex-col lg:flex-row bg-white h-screen w-full overflow-hidden">
      {/* Formulário */}
      <div className="w-full lg:w-1/2 p-4 md:p-6 lg:p-10 mb-10 overflow-y-auto">
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
              <span className="text-sm">Back</span>
            </Button>
          </div>

          <div className="w-full flex flex-col justify-center items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Registro</h1>
            <p className="text-gray-600 mb-6 text-center">Crie sua conta</p>
            <div className="w-full">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seuemail@gmail.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu nome"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="seu telefone"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                  <FormField
                    control={form.control}
                    name="password_confirmation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Senha</FormLabel>
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

                  <Button
                    type="submit"
                    className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : "Cadastrar"}
                  </Button>
                </form>
              </Form>
              
              <p className="text-center mt-6 text-gray-600 text-sm">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-blue-500 hover:underline font-medium">
                  Faça login
                </Link>
              </p>
            </div>
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
  
  )
}