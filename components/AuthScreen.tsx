'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { LiquidMetalButton } from '@/components/ui/liquidMetalButton'

interface AuthScreenProps {
  isLoading: boolean
  handleAuth: (email: string, pass: string, rememberMe: boolean) => void
  authMode: 'login' | 'register'
  setAuthMode: (mode: 'login' | 'register') => void
}

export const AuthScreen = ({
  isLoading,
  handleAuth,
}: AuthScreenProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState({ email: '', password: '' })

  const validateForm = () => {
    const newErrors = { email: '', password: '' }

    if (!email) newErrors.email = 'Email é obrigatório'
    else if (!email.includes('@')) newErrors.email = 'Email inválido'

    if (!password) newErrors.password = 'Senha é obrigatória'
    else if (password.length < 6)
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    handleAuth(email, password, rememberMe)
  }

   const handleButtonClick = () => {
    if (!validateForm()) return
    handleAuth(email, password, rememberMe)
  }

  return (
    <div className="relative rounded-4xl bg-black/20 backdrop-blur-xl border border-white/10 p-4 sm:p-6 lg:p-8">

      {/* Logo */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <Image
          src="/Logo.png"
          alt="Nextech Logo"
          width={160}
          height={40}
          className="h-16 sm:h-14 lg:h-16 w-auto"
          priority
        />
      </div>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-2xl font-semibold text-white mb-2">
          Bem-vindo
        </h1>
        <p className="text-xs sm:text-sm lg:text-sm text-white/60">
          Acesse sua conta para continuar
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Email */}
        <div>
          <label className="block text-xs sm:text-sm lg:text-sm text-white/70 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors({ ...errors, email: '' })
              }}
              disabled={isLoading}
              className="pl-10 bg-transparent text-white placeholder:text-white"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs sm:text-sm lg:text-sm text-white/70 mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors({ ...errors, password: '' })
              }}
              disabled={isLoading}
              className="pl-10 pr-10 bg-transparent text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember */}
        <label className="flex items-center gap-2 text-xs sm:text-sm lg:text-sm text-white/60 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className="accent-white"
          />
          Lembrar por 30 dias
        </label>

        {/* Submit */}
        <div className="w-full flex justify-center pt-2 cursor-pointer">
          <div onClick={handleButtonClick}>
            <LiquidMetalButton
              label={isLoading ? 'Entrando…' : 'Fazer login'}
            />
          </div>
        </div>
      </form>

      {/* Info */}
      <div className="mt-4 sm:mt-6 lg:mt-6 rounded-2xl bg-black/30 border border-white/10 p-3 sm:p-4 lg:p-4 text-center">
        <p className="text-xs sm:text-sm lg:text-sm text-white/60">
          🔐 <strong className="text-white">Login seguro</strong>
          <br />
          Após o login, gerencie seus fluxos
        </p>
      </div>
    </div>
  )
}