'use client';

import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface VerifyCodeProps {
  email: string;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  handleVerifyCode: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export const VerifyCodeScreen = ({
  email, verificationCode, setVerificationCode, handleVerifyCode,
  loading, error, onBack
}: VerifyCodeProps) => (
  <div className="backdrop-blur-xl bg-black/20 border border-white/10 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-md w-full">
    
    {/* Logo */}
    <div className="flex justify-center mb-4 sm:mb-6 lg:mb-6">
      <Image
        src="/Logo.png"
        alt="Logo"
        width={160}
        height={40}
        className="h-10 sm:h-12 lg:h-12 w-auto"
        priority
      />
    </div>

    {/* Header */}
    <div className="text-center mb-6 sm:mb-8 lg:mb-8">
      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-16 lg:h-16 rounded-2xl bg-linear-to-br from-[#7cb8c7] to-[#607585] mb-3 sm:mb-4 lg:mb-4 shadow-[0_0_30px_rgba(124,184,199,0.3)]">
        <span className="text-white font-bold text-xl sm:text-2xl lg:text-2xl">📧</span>
      </div>
      <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold text-white mb-2">Verifique seu Email</h1>
      <p className="text-white/60 text-xs sm:text-sm lg:text-sm px-2">
        Código enviado para <span className="text-[#7cb8c7] font-medium break-all">{email}</span>
      </p>
    </div>

    {/* Error Alert */}
    {error && (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 sm:px-4 lg:px-4 py-2 sm:py-3 lg:py-3 rounded-xl mb-4 sm:mb-6 lg:mb-6 text-xs sm:text-sm lg:text-sm backdrop-blur-sm">
        ⚠️ {error}
      </div>
    )}

    {/* Form */}
    <form onSubmit={handleVerifyCode} className="space-y-4 sm:space-y-6 lg:space-y-6">
      {/* Code Input */}
      <div>
        <label className="block text-xs sm:text-sm lg:text-sm font-medium text-white/80 mb-2 sm:mb-3 lg:mb-3 text-center">
          Código de Verificação
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full bg-white/5 border border-[#607585]/30 rounded-xl text-white text-center text-2xl sm:text-3xl lg:text-4xl tracking-[0.5rem] sm:tracking-[0.75rem] lg:tracking-[1rem] font-bold py-3 sm:py-4 lg:py-5 focus:bg-[#7cb8c7]/5 focus:border-[#7cb8c7] outline-none transition-all placeholder:text-white/20"
          maxLength={6}
          placeholder="000000"
          required
          autoFocus
        />
        <p className="text-xs text-white/50 mt-2 text-center">
          ⏱️ O código expira em 10 minutos
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 sm:gap-3 lg:gap-3">
        <Button
          type="submit"
          disabled={loading || verificationCode.length !== 6}
          className={`w-full h-11 sm:h-12 lg:h-12 font-semibold text-sm sm:text-base lg:text-base transition-all duration-300 rounded-xl ${
            loading || verificationCode.length !== 6
              ? "bg-linear-to-r from-[#7cb8c7] to-[#607585] opacity-50 cursor-not-allowed"
              : "bg-linear-to-r from-[#7cb8c7] to-[#607585] hover:from-[#607585] hover:to-[#42504d] shadow-[0_0_20px_rgba(124,184,199,0.2)]"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              <span>Validando...</span>
            </div>
          ) : (
            'Confirmar Código'
          )}
        </Button>

        <button
          type="button"
          onClick={onBack}
          className="text-xs sm:text-sm lg:text-sm text-white/60 hover:text-[#7cb8c7] transition-colors py-2"
        >
          ← Voltar para o login
        </button>
      </div>
    </form>

    {/* Help Text */}
    <div className="mt-4 sm:mt-6 lg:mt-6 p-3 sm:p-4 lg:p-4 bg-[#7cb8c7]/5 border border-[#7cb8c7]/10 rounded-xl backdrop-blur-sm">
      <p className="text-xs sm:text-sm lg:text-sm text-white/70 text-center">
        <strong className="text-[#7cb8c7]">💡 Não recebeu o código?</strong><br/>
        Verifique a pasta de spam ou aguarde alguns segundos
      </p>
    </div>
  </div>
);