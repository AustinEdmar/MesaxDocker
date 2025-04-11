"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import axios from 'axios'
import { toast } from 'sonner'
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
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

// Type for form data
type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form with React Hook Form and Zod resolver
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      
      // Make API request to your Laravel backend
      const response = await axios.post('http://127.0.0.1/api/login', data, {
        // Configure how axios handles errors
        validateStatus: (status) => {
          return status < 500; // Resolve for any status less than 500
        }
      })
      
      // Check if status is 401 (Unauthorized)
      if (response.status === 401) {
        toast.error("Credenciais inválidas", {
          description: "Email ou senha incorretos",
        })
        return; // Stop execution here
      }
      
      // If we get here, login was successful
      // Store token and user data
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      // Show success message using Sonner
      toast.success("Login realizado com sucesso", {
        description: "Redirecionando para o dashboard...",
      })
      
      // Redirect to dashboard
      router.push('/')
    } catch (error) {
      // This will handle network errors and other unexpected issues
      toast.error("Erro ao fazer login", {
        description: "Ocorreu um erro ao conectar com o servidor. Tente novamente mais tarde.",
      })
      
      // Log error for debugging purposes only
      console.error('Unexpected login error:', error)
    } finally {
      setIsLoading(false)
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
          </div>

          <div className="w-full flex flex-col flex-grow justify-center items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Login</h1>
            <p className="text-gray-600 mb-6 text-center">Acesse sua conta</p>

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

                <p className="text-center mt-6 text-gray-600 text-sm text-right">
                  <Link href="/forgot" className="text-blue-500 hover:underline font-medium">
                    Esqueceu sua senha?
                  </Link>
                </p>

                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Entrar"}
                </Button>
              </form>
            </Form>
            
            <p className="text-center mt-6 text-gray-600 text-sm">
              Ainda não tem uma conta?{' '}
              <Link href="/register" className="text-blue-500 hover:underline font-medium">
                Registre-se
              </Link>
            </p>
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