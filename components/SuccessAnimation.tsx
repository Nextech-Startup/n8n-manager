'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const SuccessAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 25);

    const timer = setTimeout(onComplete, 3800);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#101719] flex items-center justify-center overflow-hidden fixed inset-0 z-100 px-4">
      
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 sm:top-20 lg:top-20 right-10 sm:right-20 lg:right-20 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-[#7cb8c7] rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] lg:blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 lg:bottom-20 left-10 sm:left-20 lg:left-20 w-40 sm:w-60 lg:w-80 h-40 sm:h-60 lg:h-80 bg-[#607585] rounded-full mix-blend-multiply filter blur-[80px] sm:blur-[100px] lg:blur-[120px] opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 lg:gap-8">
        
        {/* Container Circular */}
        <div className="relative w-32 sm:w-40 lg:w-48 h-32 sm:h-40 lg:h-48 flex items-center justify-center">
          
          {/* Anel Externo (Horário) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#7cb8c7] border-r-[#607585]"
          />

          {/* Anel Interno (Anti-horário) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 sm:inset-3 lg:inset-4 rounded-full border-2 border-transparent border-b-[#607585] border-l-[#42504d]"
          />

          {/* Círculo Central com Checkmark */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
            className="w-20 sm:w-28 lg:w-32 h-20 sm:h-28 lg:h-32 rounded-full bg-linear-to-br from-[#7cb8c7] to-[#607585] flex items-center justify-center shadow-[0_0_30px_rgba(124,184,199,0.4)] sm:shadow-[0_0_40px_rgba(124,184,199,0.4)] lg:shadow-[0_0_50px_rgba(124,184,199,0.4)]"
          >
            <motion.svg
              className="w-12 sm:w-16 lg:w-20 h-12 sm:h-16 lg:h-20 text-[#101719]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3.5"
            >
              <motion.polyline
                points="20 6 9 17 4 12"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 1, ease: "easeInOut" }}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </div>

        {/* Textos */}
        <div className="text-center px-4">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3 lg:mb-3"
          >
            Acesso Liberado!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-white/60 text-sm sm:text-base lg:text-lg"
          >
            Iniciando o gerenciador de workflows...
          </motion.p>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-3 w-48 sm:w-56 lg:w-64">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative border border-white/5">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-linear-to-r from-[#7cb8c7] to-[#607585] shadow-[0_0_15px_#7cb8c7]"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear" }}
            />
          </div>
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#7cb8c7] font-mono text-xs sm:text-sm lg:text-sm font-bold"
          >
            {progress}%
          </motion.span>
        </div>
      </div>
    </div>
  );
};