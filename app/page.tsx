'use client'

import { useState, useEffect } from 'react'
import { AuthScreen } from '@/components/AuthScreen'
import { VerifyCodeScreen } from '@/components/VerifyCodeScreen'
import { SuccessAnimation } from '@/components/SuccessAnimation'
import { LogoutAnimation } from '@/components/LogoutAnimation'
import { Dashboard } from '@/components/Dashboard'
import { Background } from "@/components/Background"
import { ConfirmDialog } from '@/components/Confirmdialog'
import { useAuth } from './hooks/useAuth'
import { useAccounts } from './hooks/useAccounts'
import { useWorkflows } from './hooks/useWorkflows'
import { N8nAccount } from './types'

export default function Page() {
  const auth = useAuth()
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false)
  
  // ✅ FIX: Só carrega workflows se a conta existir
  const handleAccountSelected = (account: N8nAccount | null) => {
    if (account) {
      workflows.loadWorkflows()
    }
  }
  
  const accounts = useAccounts(auth.token, handleAccountSelected)
  const workflows = useWorkflows(auth.token, accounts.selectedAccount)

  useEffect(() => {
    if (auth.step === 'dashboard' && accounts.selectedAccount && workflows.workflows.length === 0) {
      workflows.loadWorkflows()
    }
  }, [auth.step, accounts.selectedAccount?.id])

  const handleLogoutSystem = async () => {
    setShowLogoutAnimation(true)
  }

  const completeLogout = () => {
    auth.handleLogout?.()
    localStorage.removeItem('accessToken')
    window.location.href = '/'
  }

  if (showLogoutAnimation) {
    return <LogoutAnimation onComplete={completeLogout} />
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      
      <Background />

      <div className="relative z-1 min-h-screen flex items-center justify-center p-4">
        
        {(auth.step === 'auth' || auth.step === 'verify' || auth.step === 'success') && (
          <div className="w-full max-w-md">
            <div className=" rounded-2xl p-6 ">
              {auth.step === 'auth' && (
                <AuthScreen isLoading={auth.loading} handleAuth={auth.handleAuth} authMode="login" setAuthMode={() => {}} />
              )}
              {auth.step === 'verify' && (
                <VerifyCodeScreen email={auth.email} verificationCode={auth.verificationCode} setVerificationCode={auth.setVerificationCode} handleVerifyCode={auth.handleVerifyCode} loading={auth.loading} error={auth.error} onBack={auth.handleBackToLogin} />
              )}
              {auth.step === 'success' && (
                <SuccessAnimation onComplete={auth.handleSuccessComplete} />
              )}
            </div>
          </div>
        )}

        {auth.step === 'dashboard' && auth.user && (
          <div className="w-full h-full max-w-7xl mx-auto py-8 self-start">
            <Dashboard
              userEmail={auth.user.email}
              onLogout={handleLogoutSystem}
              accounts={accounts.accounts}
              selectedAccount={accounts.selectedAccount}
              setSelectedAccount={accounts.setSelectedAccount}
              showAccountForm={accounts.showAccountForm}
              setShowAccountForm={accounts.setShowAccountForm}
              accountForm={accounts.accountForm}
              setAccountForm={accounts.setAccountForm}
              createAccount={accounts.createAccount}
              deleteAccount={accounts.requestDeleteAccount}
              setDefaultAccount={accounts.setDefaultAccount}
              accountLoading={accounts.loading}
              workflows={workflows.workflows}
              searchTerm={workflows.searchTerm}
              setSearchTerm={workflows.setSearchTerm}
              loadWorkflows={workflows.loadWorkflows}
              toggleWorkflow={workflows.toggleWorkflow}
              workflowLoading={workflows.loading}
              toggling={workflows.toggling}
            />
          </div>
        )}
      </div>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={accounts.confirmDialog.isOpen}
        title="Deletar Instância"
        message={`Tem certeza que deseja deletar "${accounts.confirmDialog.accountName}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, deletar"
        cancelText="Cancelar"
        onConfirm={accounts.confirmDeleteAccount}
        onCancel={accounts.cancelDeleteAccount}
      />
    </main>
  )
}