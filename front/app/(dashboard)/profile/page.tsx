"use client"

import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/loading-spinner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Schema de validação para atualização de perfil
const profileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  access_level: z.number().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function UserProfile() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, fetchUserData, updateUser, error } = useAuthStore()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
    
  // Carrega os dados do usuário ao montar o componente
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    } else {
      // Redireciona para login se não estiver autenticado
      router.push('/login')
    }
  }, [isAuthenticated, fetchUserData, router])

  // Setup do formulário
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      access_level: user?.access_level || 0,
    },
  })

  // Atualiza o formulário quando o usuário é carregado
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        access_level: user.access_level,
      })
    }
  }, [user, form])

  // Função para lidar com o upload de imagem
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    
    if (file) {
      setPhotoFile(file)
      
      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true)
      
      // Sempre criar um FormData para unificar o tratamento com/sem foto
      const formData = new FormData()
      
      // Adicionar os dados do formulário
      formData.append('name', data.name)
      formData.append('email', data.email)
      if (data.access_level !== undefined) {
        formData.append('access_level', data.access_level.toString())
      }
      
      // Adicionar foto apenas se houver uma nova
      if (photoFile) {
        formData.append('profile_photo', photoFile)
      }
      
      // Enviar os dados para a API
      const success = await updateUser(formData)
      
      if (success) {
        toast.success("Perfil atualizado", {
          description: "Seus dados foram atualizados com sucesso",
        })
        setPhotoFile(null)
        setPhotoPreview(null)
      } else if (error) {
        toast.error("Erro ao atualizar perfil", {
          description: error,
        })
      }
    } catch (err) {
      console.error("Form submission error:", err)
      toast.error("Erro ao processar formulário", {
        description: "Ocorreu um erro ao processar o formulário. Tente novamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostra tela de carregamento enquanto busca dados
  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    )
  }

  // Construir URL da foto de perfil
  const getProfilePhotoUrl = () => {
    if (photoPreview) return photoPreview
    if (user?.profile_photo) {
      // Verifica se já é uma URL completa
      if (user.profile_photo.startsWith('http')) {
        return user.profile_photo
      }
      // Caso contrário, considera como caminho relativo ao storage público
      return `${process.env.NEXT_PUBLIC_API_IMAGE}/storage/${user.profile_photo}`
    }
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Visualize e atualize suas informações de cadastro
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {user ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Área de upload de foto */}
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={getProfilePhotoUrl() || ''} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <label className="cursor-pointer">
                    <span className="text-sm text-blue-600 hover:text-blue-800">
                      Alterar foto de perfil
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/gif"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </form>
            </Form>
          ) : (
            <p>Nenhum dado de usuário disponível</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}