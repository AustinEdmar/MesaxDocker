"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useAuthStore } from '@/stores/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'

import Autoplay from "embla-carousel-autoplay"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

// Define validation schema using Zod
const forgotSchema = z.object({
  email: z.string().email('Email inválido')
})

// Type for form data
type ForgotFormValues = z.infer<typeof forgotSchema>

export default function Forgot() {
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const { forgotPassword, isLoading, error, clearError } = useAuthStore()

  // Initialize form with React Hook Form and Zod resolver
  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotFormValues) => {
    // Limpa qualquer erro anterior
    clearError()
    
    try {
      // Usa a ação de forgotPassword da store
      const success = await forgotPassword(data.email)
      setSent(true)
      console.log(success);
      
      if (success) {
        // Mostra mensagem de sucesso
        toast.success("Email de redefinição de senha enviado com sucesso", {
          description: "Verifique seu email para redefinir sua senha.",
        })
        
        // Redireciona para o login
       // router.push('/login')
      }
    } catch (error) {
      // Os erros já são tratados na store e pelos interceptores
      // Não é necessário tratamento adicional aqui
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
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <div className="w-full flex flex-col flex-grow justify-center items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">Recuperar Senha</h1>
        <p className="text-gray-600 mb-6 text-center">Insira o email cadastrado</p>

        
          {sent && <p className="text-green-600 mb-6 text-center">Email de redefinição de senha enviado com sucesso, verifique seu email para redefinir sua senha.</p>}
    

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

                <Button
                  type="submit"
                  className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600"
                  disabled={isLoading}
                >
                  {isLoading ? "Processando..." : "Recuperar Senha"}
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
                //src={`../auth${index + 1}.svg`}
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
