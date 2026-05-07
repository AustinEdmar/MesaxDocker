"use client"

import React, { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const profileSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  access_level: z.number().optional(),
})
type ProfileFormValues = z.infer<typeof profileSchema>

// ── Helpers ────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
}
function getAccessLabel(level?: number) {
  if (level === 2) return "Gerente"
  if (level === 1) return "Supervisor"
  if (level === -1) return "Desativado"
  return "Funcionário"
}
function getAccessIcon(level?: number) {
  if (level === 2) return "◆"
  if (level === 1) return "▲"
  if (level === -1) return "✕"
  return "●"
}

// ── Animated Field ─────────────────────────────────────────
function Field({
  label, hint, error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#78716C]">{label}</label>
        {hint && <span className="text-[10px] text-[#C4C0BB]">{hint}</span>}
      </div>
      <div className={`relative rounded-[10px] transition-all duration-200 ${focused ? "shadow-[0_0_0_3px_rgba(249,115,22,0.12)]" : ""}`}>
        <input
          {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e) }}
          onBlur={e => { setFocused(false); props.onBlur?.(e) }}
          className={`
            w-full px-4 py-[11px] text-[13.5px] font-medium text-[#1C1917]
            bg-white border rounded-[10px] outline-none transition-all duration-200
            placeholder:text-[#D6D3D1] disabled:opacity-40
            ${error
              ? "border-[#FCA5A5]"
              : focused
                ? "border-[#F97316]"
                : "border-[#E7E5E4] hover:border-[#D6D3D1]"
            }
          `}
        />
      </div>
      {error && (
        <p className="text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
          <span>↑</span> {error}
        </p>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function UserProfile() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, fetchUserData, updateUser, error } = useAuthStore()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pwVisible, setPwVisible] = useState(false)
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwError, setPwError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isAuthenticated) fetchUserData()
    else router.push('/login')
  }, [isAuthenticated, fetchUserData, router])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      access_level: user?.access_level || 0,
    },
  })

  useEffect(() => {
    if (user) form.reset({ name: user.name, email: user.email, access_level: user.access_level })
  }, [user, form])

  const handlePhotoChange = (file: File | null) => {
    if (!file) return
    if (file.size > 3 * 1024 * 1024) { toast.error('Limite de 3MB excedido'); return }
    setPhotoFile(file)
    const r = new FileReader()
    r.onload = e => setPhotoPreview(e.target?.result as string)
    r.readAsDataURL(file)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setPwError("")
    if (newPw && newPw !== confirmPw) { setPwError("Passwords não coincidem"); return }
    try {
      setIsSubmitting(true)
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('email', data.email)
      if (data.access_level !== undefined) fd.append('access_level', data.access_level.toString())
      if (photoFile) fd.append('profile_photo', photoFile)
      if (newPw) { fd.append('password', newPw); fd.append('password_confirmation', confirmPw) }
      const ok = await updateUser(fd)
      if (ok) {
        toast.success("Perfil guardado")
        setPhotoFile(null); setPhotoPreview(null); setNewPw(""); setConfirmPw("")
      } else if (error) toast.error(error)
    } catch {
      toast.error("Erro ao guardar")
    } finally {
      setIsSubmitting(false)
    }
  }

  const photoUrl = photoPreview
    ?? (user?.profile_photo
      ? user.profile_photo.startsWith('http')
        ? user.profile_photo
        : `${process.env.NEXT_PUBLIC_API_IMAGE}/storage/${user.profile_photo}`
      : null)

  const role = getAccessLabel(user?.access_level)
  const roleIcon = getAccessIcon(user?.access_level)

  if (isLoading && !user) return (
    <>
      <style>{STYLES}</style>
      <div className="flex items-center justify-center min-h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[#F97316] border-t-transparent spinner" />
          <span className="text-[11px] text-[#A8A29E] tracking-widest uppercase font-semibold">A carregar</span>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-full flex flex-col gap-0 font-sans">
      <style>{STYLES}</style>

      {/* Page header */}
      <div className="fade-up-0 mb-5">
        <h1 className="text-[22px] font-bold text-[#1C1917] tracking-tight">O Meu Perfil</h1>
        <p className="text-[13px] text-[#A8A29E] mt-[2px]">Identidade e configurações da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5 items-start">

        {/* ══ LEFT — dark identity card ══ */}
        <div className="fade-up-1 rounded-[18px] overflow-hidden bg-[#1C1917] shadow-[0_8px_32px_rgba(0,0,0,0.18)] flex flex-col">

          {/* Geometric header */}
          <div className="relative h-[80px] overflow-hidden shrink-0 bg-[#161412]">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="pg" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                </pattern>
                <pattern id="pd" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="0.8" fill="rgba(255,255,255,0.06)" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pg)" />
              <rect width="100%" height="100%" fill="url(#pd)" />
            </svg>
            {/* Orange bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F97316] via-[#FB923C] to-transparent" />
            {/* Ghost initials */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[58px] font-black leading-none select-none pointer-events-none"
              style={{ color: "rgba(255,255,255,0.03)" }}>
              {user ? getInitials(user.name) : "??"}
            </div>
          </div>

          {/* Avatar overlap */}
          <div className="px-5 -mt-8 pb-0">
            <div className="avatar-pop relative w-[66px] h-[66px] mb-4">
              <div
                className="w-[66px] h-[66px] rounded-[16px] overflow-hidden cursor-pointer relative group"
                style={{ boxShadow: "0 0 0 3px #1C1917, 0 4px_20px_rgba(0,0,0,0.5)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {photoUrl
                  ? <img src={photoUrl} alt={user?.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-[#F97316] to-[#FDBA74] flex items-center justify-center">
                    <span className="text-white text-[22px] font-black">{user ? getInitials(user.name) : "?"}</span>
                  </div>
                }
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg width="16" height="16" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-[14px] h-[14px] rounded-full border-2 border-[#1C1917]"
                style={{ background: user?.access_level === -1 ? "#A8A29E" : "#10B981" }} />
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handlePhotoChange(e.target.files?.[0] ?? null)} />

            <h2 className="text-[17px] font-black text-[#FAFAF9] leading-tight">{user?.name ?? "—"}</h2>
            <p className="text-[11.5px] text-[#57534E] mt-[2px] truncate">{user?.email ?? "—"}</p>

            {/* Role tag */}
            <div className="mt-3 inline-flex items-center gap-[5px] px-[10px] py-[4px] rounded-[7px]"
              style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.22)" }}>
              <span className="text-[#F97316] text-[9px]">{roleIcon}</span>
              <span className="text-[11.5px] font-bold text-[#FB923C]">{role}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 my-4 h-px bg-[#292524]" />

          {/* Info rows */}
          <div className="px-5 flex flex-col gap-[14px]">
            {[
              {
                label: "ID",
                value: `#${user?.id ?? "—"}`,
                icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
              },
              {
                label: "Acesso",
                value: role,
                icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
              },
              {
                label: "Estado",
                value: user?.access_level === -1 ? "Inativo" : "Ativo",
                accent: user?.access_level !== -1,
                icon: <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
              },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#57534E]">
                  {s.icon}
                  <span className="text-[11px] text-[#57534E]">{s.label}</span>
                </div>
                <span className={`text-[11.5px] font-bold ${s.accent ? "text-[#10B981]" : "text-[#78716C]"}`}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Photo button */}
          <div className="px-5 pb-5 mt-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-[8px] rounded-[10px] border border-[#292524] text-[11.5px] font-semibold text-[#57534E] hover:border-[#F97316] hover:text-[#F97316] transition-all cursor-pointer bg-transparent"
            >
              {photoFile
                ? <span className="text-[#F97316]">✓ {photoFile.name.slice(0, 22)}</span>
                : "Alterar foto de perfil"
              }
            </button>
          </div>
        </div>

        {/* ══ RIGHT — form panels ══ */}
        <div className="flex flex-col gap-4">

          {/* Panel — personal info */}
          <div className="fade-up-2 bg-white rounded-[18px] border border-[#F0EDEB]">
            <div className="px-6 py-[14px] border-b border-[#F5F4F0] flex items-center gap-3">
              <div className="w-7 h-7 rounded-[8px] bg-[#FFF4ED] flex items-center justify-center shrink-0">
                <svg width="13" height="13" fill="none" stroke="#F97316" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-[#1C1917]">Informações Pessoais</h3>
                <p className="text-[11px] text-[#A8A29E]">Nome e endereço de email</p>
              </div>
            </div>
            <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)}
              className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Nome completo"
                placeholder="Ex: Ana Lima"
                error={form.formState.errors.name?.message}
                {...form.register("name")}
              />
              <Field
                label="Email"
                type="email"
                placeholder="email@exemplo.com"
                error={form.formState.errors.email?.message}
                {...form.register("email")}
              />
            </form>
          </div>

          {/* Panel — security (collapsible) */}
          <div className="fade-up-3 bg-white rounded-[18px] border border-[#F0EDEB] overflow-hidden">
            <button
              type="button"
              onClick={() => setPwVisible(!pwVisible)}
              className="w-full px-6 py-[14px] flex items-center justify-between cursor-pointer bg-transparent hover:bg-[#FAFAF9] transition-colors border-b border-[#F5F4F0]"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-[8px] bg-[#F5F4F0] flex items-center justify-center shrink-0">
                  <svg width="13" height="13" fill="none" stroke="#78716C" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="text-[13px] font-bold text-[#1C1917]">Segurança</h3>
                  <p className="text-[11px] text-[#A8A29E]">Alterar password de acesso</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {newPw && <span className="text-[10px] font-bold text-[#F97316] bg-[#FFF4ED] px-2 py-[2px] rounded-full">Alterada</span>}
                <svg width="14" height="14" fill="none" stroke="#A8A29E" strokeWidth="2" viewBox="0 0 24 24"
                  className={`transition-transform duration-200 ${pwVisible ? "rotate-180" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </button>

            {pwVisible && (
              <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 panel-open">
                <Field
                  label="Nova password"
                  type="password"
                  placeholder="••••••••"
                  hint="Mín. 8 caracteres"
                  value={newPw}
                  onChange={e => setNewPw((e.target as HTMLInputElement).value)}
                />
                <Field
                  label="Confirmar password"
                  type="password"
                  placeholder="••••••••"
                  error={pwError}
                  value={confirmPw}
                  onChange={e => { setConfirmPw((e.target as HTMLInputElement).value); setPwError("") }}
                />
              </div>
            )}
          </div>

          {/* Actions bar */}
          <div className="fade-up-4 bg-white rounded-[18px] border border-[#F0EDEB] px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[11.5px] text-[#C4C0BB]">
              {photoFile
                ? <span className="text-[#F97316] font-semibold">Nova foto pronta — confirme para guardar</span>
                : "Alterações aplicadas após guardar"
              }
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  form.reset()
                  setPhotoFile(null); setPhotoPreview(null)
                  setNewPw(""); setConfirmPw(""); setPwError("")
                }}
                className="text-[13px] font-semibold px-4 py-[9px] rounded-[10px] bg-[#F5F4F0] text-[#78716C] hover:bg-[#ECEAE7] transition-colors cursor-pointer border-none"
              >
                Descartar
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={isSubmitting || isLoading}
                className="flex items-center gap-2 text-[13px] font-bold px-5 py-[9px] rounded-[10px] bg-[#1C1917] text-white hover:bg-[#292524] disabled:opacity-50 transition-all cursor-pointer border-none"
                style={{ boxShadow: "0 2px 12px rgba(28,25,23,0.18)" }}
              >
                {(isSubmitting || isLoading) && (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className="spinner">
                    <circle cx="12" cy="12" r="10" opacity=".2" />
                    <path d="M12 2a10 10 0 019.4 6.6" />
                  </svg>
                )}
                {isSubmitting ? "A guardar…" : "Guardar Alterações"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────
const STYLES = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes scalePop {
    from { opacity: 0; transform: scale(0.86); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-up-0 { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-1 { animation: fadeUp 0.4s 0.06s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-2 { animation: fadeUp 0.4s 0.12s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-3 { animation: fadeUp 0.4s 0.18s cubic-bezier(0.22,1,0.36,1) both; }
  .fade-up-4 { animation: fadeUp 0.4s 0.24s cubic-bezier(0.22,1,0.36,1) both; }
  .avatar-pop { animation: scalePop 0.5s 0.1s cubic-bezier(0.34,1.56,0.64,1) both; }
  .spinner    { animation: spin 0.8s linear infinite; }
  .panel-open { animation: fadeUp 0.2s ease both; }
`