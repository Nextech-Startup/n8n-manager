'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

export const LogoutAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    const timer = setTimeout(onComplete, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#101719] flex items-center justify-center overflow-hidden fixed inset-0 z-9999 px-4">
      
      {/* Background Blobs - Saindo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 1.5 }}
          className="absolute top-10 sm:top-20 lg:top-20 right-10 sm:right-20 lg:right-20 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-[#7cb8c7] rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] lg:blur-[120px]"
        />
        <motion.div 
          initial={{ opacity: 0.2 }}
          animate={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 1.5, delay: 0.2 }}
          className="absolute bottom-10 sm:bottom-20 lg:bottom-20 left-10 sm:left-20 lg:left-20 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-[#607585] rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] lg:blur-[120px]"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 lg:gap-8">
        
        {/* Container Circular */}
        <div className="relative w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 flex items-center justify-center">
          
          {/* Anel Externo - Desaparecendo */}
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.2, 0],
              opacity: [1, 0.5, 0]
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#7cb8c7] border-r-[#607585]"
          />

          {/* Anel Interno - Desaparecendo */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 0.8, 0],
              opacity: [1, 0.5, 0]
            }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-2 sm:inset-3 lg:inset-4 rounded-full border-2 border-transparent border-b-[#607585] border-l-[#42504d]"
          />

          {/* Círculo Central com Ícone de Saída */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ 
              scale: [1, 1.1, 0],
              opacity: [1, 1, 0]
            }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="w-20 sm:w-28 lg:w-32 h-20 sm:h-28 lg:h-32 rounded-full bg-linear-to-br from-[#7cb8c7] to-[#607585] flex items-center justify-center shadow-[0_0_30px_rgba(124,184,199,0.4)] sm:shadow-[0_0_40px_rgba(124,184,199,0.4)] lg:shadow-[0_0_50px_rgba(124,184,199,0.4)]"
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <LogOut className="w-10 sm:w-12 lg:w-16 h-10 sm:h-12 lg:h-16 text-[#101719]" strokeWidth={2.5} />
            </motion.div>
          </motion.div>
        </div>

        {/* Textos */}
        <motion.div 
          className="text-center px-4"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-3">
            Saindo...
          </h2>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg">
            Encerrando sua sessão com segurança
          </p>
        </motion.div>

        {/* Progress Bar - Invertida */}
        <motion.div 
          className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-3 w-48 sm:w-56 lg:w-64"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-linear-to-r from-[#607585] to-[#42504d] shadow-[0_0_15px_#607585]"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 2, ease: "linear" }}
            />
          </div>
          <span className="text-[#607585] font-mono text-xs sm:text-sm lg:text-sm font-bold">
            {100 - progress}%
          </span>
        </motion.div>
      </div>
    </div>
  );
};