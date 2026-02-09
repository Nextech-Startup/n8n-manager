'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidMetalButton } from '@/components/ui/liquidMetalButton'
import { AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Sim',
  cancelText = 'Não',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  
  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onCancel()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onCancel])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative backdrop-blur-xl bg-[#101719]/90 border border-[#7cb8c7]/30 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
          >
            {/* Ícone de alerta */}
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            {/* Título */}
            <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-3">
              {title}
            </h3>
            
            {/* Mensagem */}
            <p className="text-sm sm:text-base text-white/60 text-center mb-8">
              {message}
            </p>
            
            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <div onClick={onCancel} className="cursor-pointer">
                <LiquidMetalButton
                  label={cancelText}
                  onClick={onCancel}
                />
              </div>
              
              <div onClick={onConfirm} className="cursor-pointer">
                <LiquidMetalButton
                  label={confirmText}
                  onClick={onConfirm}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}