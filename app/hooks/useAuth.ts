"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/app/types";

export const useAuth = () => {
  const [step, setStep] = useState<"auth" | "verify" | "success" | "dashboard">("auth");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasCheckedRefreshOnMount = useRef(false);

  const tryRefreshToken = () => {
    console.log('🔵 [useAuth] tryRefreshToken chamado');
    const savedRefreshToken = localStorage.getItem("refreshToken");
    const savedUser = localStorage.getItem("user");

    if (savedRefreshToken && savedUser) {
      console.log('🔵 [useAuth] Chamando /api/auth/refresh...');
      setLoading(true);
      
      fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: savedRefreshToken })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('✅ [useAuth] Token renovado automaticamente');
          setToken(data.token);
          setUser(JSON.parse(savedUser));
          localStorage.setItem('token', data.token);
          setStep("dashboard");
        } else {
          console.log('❌ [useAuth] Refresh expirado, indo para auth');
          setStep("auth");
        }
      })
      .catch(() => setStep("auth"))
      .finally(() => {
        setLoading(false);
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (!hasCheckedRefreshOnMount.current) {
      hasCheckedRefreshOnMount.current = true;
      tryRefreshToken();
    }
  }, []);

  // 🟢 ATUALIZAÇÃO NO HANDLEAUTH: PULAR 2FA
  const handleAuth = async (emailInput: string, password: string, remember: boolean) => {
    setLoading(true);
    setError(null);
    setEmail(emailInput);
    setRememberMe(remember);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: emailInput, 
          password,
          rememberMe: remember
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Erro ao fazer login");
        return;
      }

      // 🚀 LOGICA DE PULAR 2FA (CONFIANÇA)
      if (data.requiresCode === false && data.token) {
        console.log('🚀 [useAuth] Dispositivo confiável! Pulando 2FA...');
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep("success"); // Vai para animação de sucesso e depois dashboard
      } else {
        console.log('✅ [useAuth] Requer 2FA. Indo para verify...');
        setPendingUserId(data.userId);
        setStep("verify");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId: pendingUserId, 
          code: verificationCode,
          rememberMe 
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Código inválido");
        return;
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Salva o Refresh Token no LocalStorage se vier da API
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      
      setStep("success");
    } catch (err) {
      setError("Erro ao validar código");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep("auth");
    setVerificationCode("");
    setError(null);
  };

  const handleSuccessComplete = () => {
    setStep("dashboard");
  };

  // 🔴 ATUALIZAÇÃO NO LOGOUT: PRESERVAR REFRESH TOKEN
  const handleLogout = () => {
    console.log('🔴🔴🔴 [useAuth] ===== LOGOUT CIRÚRGICO =====');
    
    // Removemos o token de acesso (sessão atual)
    localStorage.removeItem('token');
    
    // ❌ NÃO REMOVEMOS o refreshToken nem o user se quisermos manter a confiança
    // Se removermos o refreshToken aqui, o "Dispositivo Confiável" morre.
    // Mas para o sistema entender que deslogou, limpamos o estado:
    
    setToken(null);
    setUser(null);
    setStep('auth');
    
    console.log('✅ [useAuth] Logout concluído. RefreshToken preservado no LocalStorage.');
  };

  return {
    step,
    email,
    verificationCode,
    setVerificationCode,
    error,
    loading,
    token,
    user,
    isReady,
    handleAuth,
    handleVerifyCode,
    handleBackToLogin,
    handleSuccessComplete,
    handleLogout,
  };
};