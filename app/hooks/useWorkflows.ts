'use client'

import { useState, useEffect } from 'react'
import { Workflow, N8nAccount } from '@/app/types'

export const useWorkflows = (token: string | null, selectedAccount: N8nAccount | null) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const loadWorkflows = async () => {
    // ✅ FIX: Se não tiver conta selecionada, limpa workflows
    if (!selectedAccount || !token) {
      setWorkflows([])
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch(`/api/workflows?accountId=${selectedAccount.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      
      if (data.success) {
        setWorkflows(data.workflows || [])
      } else {
        // ✅ FIX: Se falhar (conta deletada), limpa workflows
        setWorkflows([])
      }
    } catch (err) {
      // ✅ FIX: Em caso de erro, limpa workflows
      setWorkflows([])
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkflow = async (id: string, active: boolean) => {
    if (!selectedAccount || !token) return
    setToggling(id)

    try {
      const response = await fetch('/api/workflows/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          accountId: selectedAccount.id,
          workflowId: id,
          active: !active
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setWorkflows(workflows.map(w => 
          w.id === id ? { ...w, active: !active } : w
        ))
      }
    } catch (err) {
      // Erro ao alternar workflow
    } finally {
      setToggling(null)
    }
  }

  // ✅ FIX: Limpa workflows quando selectedAccount muda para null
  useEffect(() => {
    if (!selectedAccount) {
      setWorkflows([])
    }
  }, [selectedAccount])

  return {
    workflows,
    searchTerm,
    setSearchTerm,
    loadWorkflows,
    toggleWorkflow,
    loading,
    toggling,
  }
}