'use client'

import { useState, useEffect } from 'react'
import { N8nAccount } from '@/app/types'

interface UseAccountsProps {
  token: string | null
  onAccountSelected?: (account: N8nAccount) => void // ← NOVO callback
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

  const loadAccounts = async () => {
    if (!token) return

    try {
      const response = await fetch('/api/n8n-accounts/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setAccounts(data.accounts)
        const defaultAccount = data.accounts.find((a: N8nAccount) => a.is_default) || data.accounts[0]
        if (defaultAccount) {
          setSelectedAccount(defaultAccount)
          // ✅ Dispara callback quando seleciona conta automaticamente
          onAccountSelected?.(defaultAccount)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar contas:', err)
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
      console.error('Erro ao criar conta:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta conta?')) return

    try {
      const response = await fetch('/api/n8n-accounts/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accountId: id })
      })

      const data = await response.json()
      if (data.success) loadAccounts()
    } catch (err) {
      console.error('Erro ao deletar conta:', err)
    }
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
      console.error('Erro ao definir conta padrão:', err)
    }
  }

  // ✅ Wrapper para setSelectedAccount que dispara o callback
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
    setSelectedAccount: handleSetSelectedAccount, // ← USA o wrapper
    showAccountForm,
    setShowAccountForm,
    accountForm,
    setAccountForm,
    createAccount,
    deleteAccount,
    setDefaultAccount,
    loading,
  }
}