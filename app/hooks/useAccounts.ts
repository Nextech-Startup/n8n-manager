'use client'

import { useState, useEffect } from 'react'
import { N8nAccount } from '@/app/types'

interface UseAccountsProps {
  token: string | null
  onAccountSelected?: (account: N8nAccount) => void
}

export const useAccounts = (token: string | null, onAccountSelected?: (account: N8nAccount) => void) => {
  const [accounts, setAccounts] = useState<N8nAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<N8nAccount | null>(null)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accountForm, setAccountForm] = useState({ 
    name: '', 
    base_url: '', 
    api_key: '', 
    is_default: false 
  })
  const [loading, setLoading] = useState(false)
  
  // Estado para o diálogo de confirmação
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    accountId: '',
    accountName: ''
  })

  const loadAccounts = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/n8n-accounts/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setAccounts(data.accounts)
        
        // ✅ FIX: Se não tiver contas, limpa selectedAccount
        if (data.accounts.length === 0) {
          setSelectedAccount(null)
          onAccountSelected?.(null as any)
          return
        }
        
        // ✅ FIX: Se a conta selecionada foi deletada, seleciona outra
        const currentSelectedId = selectedAccount?.id
        const stillExists = data.accounts.find((a: N8nAccount) => a.id === currentSelectedId)
        
        if (!stillExists) {
          // Conta atual foi deletada, seleciona a primeira disponível
          const defaultAccount = data.accounts.find((a: N8nAccount) => a.is_default) || data.accounts[0]
          setSelectedAccount(defaultAccount)
          onAccountSelected?.(defaultAccount)
        }
      }
    } catch (err) {
      // Erro ao carregar contas
    }
  }

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/n8n-accounts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(accountForm)
      })

      const data = await response.json()
      
      if (data.success) {
        setShowAccountForm(false)
        setAccountForm({ name: '', base_url: '', api_key: '', is_default: false })
        loadAccounts()
      }
    } catch (err) {
      // Erro ao criar conta
    } finally {
      setLoading(false)
    }
  }

  // Abre o diálogo de confirmação
  const requestDeleteAccount = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      accountId: id,
      accountName: name
    })
  }

  // Confirma a exclusão
  const confirmDeleteAccount = async () => {
    const deletingCurrentAccount = selectedAccount?.id === confirmDialog.accountId
    
    try {
      const response = await fetch('/api/n8n-accounts/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountId: confirmDialog.accountId })
      })

      const data = await response.json()
      if (data.success) {
        // ✅ FIX: Se deletou a conta selecionada, limpa imediatamente
        if (deletingCurrentAccount) {
          setSelectedAccount(null)
        }
        
        // Recarrega a lista (que vai selecionar outra conta automaticamente)
        await loadAccounts()
      }
    } catch (err) {
      // Erro ao deletar conta
    } finally {
      setConfirmDialog({ isOpen: false, accountId: '', accountName: '' })
    }
  }

  // Cancela a exclusão
  const cancelDeleteAccount = () => {
    setConfirmDialog({ isOpen: false, accountId: '', accountName: '' })
  }

  const setDefaultAccount = async (id: string) => {
    try {
      const response = await fetch('/api/n8n-accounts/set-default', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountId: id })
      })

      const data = await response.json()
      if (data.success) loadAccounts()
    } catch (err) {
      // Erro ao definir conta padrão
    }
  }

  // Wrapper para setSelectedAccount que dispara o callback
  const handleSetSelectedAccount = (account: N8nAccount) => {
    setSelectedAccount(account)
    onAccountSelected?.(account)
  }

  useEffect(() => {
    loadAccounts()
  }, [token])

  return {
    accounts,
    selectedAccount,
    setSelectedAccount: handleSetSelectedAccount,
    showAccountForm,
    setShowAccountForm,
    accountForm,
    setAccountForm,
    createAccount,
    requestDeleteAccount,
    confirmDeleteAccount,
    cancelDeleteAccount,
    confirmDialog,
    setDefaultAccount,
    loading,
  }
}