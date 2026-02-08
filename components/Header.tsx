'use client'

import { LogOut } from 'lucide-react'
import Image from 'next/image'
import { LiquidMetalButton } from '@/components/ui/liquidMetalButton'

export const Header = ({ userEmail, onLogout }: { userEmail: string, onLogout: () => void }) => {
  return (
    <header className="relative z-999 backdrop-blur-xl bg-[#101719]/80 border border-[#7cb8c7]/20 rounded-2xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6 lg:mb-8 flex justify-between items-center shadow-xl">
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={120}
            height={30}
            className="h-10 sm:h-12 lg:h-16 w-auto"
            priority
          />
        </div>
        
        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block w-px h-6 sm:h-8 lg:h-8 bg-white/10"></div>
        
        {/* User Info */}
        <div className="hidden sm:block">
          <h1 className="text-white font-bold text-xs sm:text-sm lg:text-sm">Gerenciador de Fluxos</h1>
          <p className="text-sm sm:text-base lg:text-xl text-white/50">{userEmail}</p>
        </div>
      </div>

      {/* Logout Button */}
      <div onClick={onLogout} className="cursor-pointer group">
        <LiquidMetalButton
          viewMode="icon"
          icon={<LogOut size={20} className="text-white group-hover:rotate-12 transition-transform" />}
        />
      </div>
    </header>
  )
}