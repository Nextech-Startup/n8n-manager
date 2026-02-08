'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { N8nAccount, Workflow } from '@/app/types'
import { Plus, Trash2, Search, RefreshCw, Zap } from "lucide-react"
import { LiquidMetalButton } from "@/components/ui/liquidMetalButton"
import { Header } from './Header'

interface DashboardProps {
    accounts: N8nAccount[]
    userEmail: string
    onLogout: () => void
    selectedAccount: N8nAccount | null
    setSelectedAccount: (acc: N8nAccount) => void
    showAccountForm: boolean
    setShowAccountForm: (show: boolean) => void
    accountForm: {
        name: string
        base_url: string
        api_key: string
        is_default: boolean
    }
    setAccountForm: (form: any) => void
    createAccount: (e: React.FormEvent) => void
    deleteAccount: (id: string) => void
    setDefaultAccount: (id: string) => void
    accountLoading: boolean
    workflows: Workflow[]
    searchTerm: string
    setSearchTerm: (s: string) => void
    loadWorkflows: () => void
    toggleWorkflow: (id: string, active: boolean) => void
    workflowLoading: boolean
    toggling: string | null
}

export const Dashboard = (props: DashboardProps) => {
    const filtered = props.workflows.filter((w: Workflow) =>
        w.name.toLowerCase().includes(props.searchTerm.toLowerCase())
    )

    const [formErrors, setFormErrors] = useState({
        name: '',
        base_url: '',
        api_key: ''
    })

    const validateForm = () => {
        const errors = {
            name: '',
            base_url: '',
            api_key: ''
        }

        if (!props.accountForm.name.trim()) {
            errors.name = 'Nome é obrigatório'
        }

        if (!props.accountForm.base_url.trim()) {
            errors.base_url = 'URL é obrigatória'
        } else if (!props.accountForm.base_url.startsWith('http')) {
            errors.base_url = 'URL deve começar com http:// ou https://'
        }

        if (!props.accountForm.api_key.trim()) {
            errors.api_key = 'Chave API é obrigatória'
        }

        setFormErrors(errors)
        return !errors.name && !errors.base_url && !errors.api_key
    }

    const handleCreateAccount = (e?: React.MouseEvent) => {
        e?.preventDefault?.()

        if (validateForm()) {
            const fakeEvent = {
                preventDefault: () => { }
            } as React.FormEvent

            props.createAccount(fakeEvent)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-4 space-y-4 sm:space-y-6 lg:space-y-6 pb-8 sm:pb-12 lg:pb-12"
        >
            <Header userEmail={props.userEmail} onLogout={props.onLogout} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-6 items-start">
                {/* ============= SIDEBAR ============= */}
                <aside className="lg:col-span-4 lg:sticky lg:top-6">
                    <div className="backdrop-blur-xl bg-[#101719]/40 border border-[#7cb8c7]/20 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg sm:text-xl lg:text-xl font-bold text-white flex items-center gap-2">
                                <span className="text-[#7cb8c7]">●</span> Instâncias
                            </h2>
                            <div onClick={() => props.setShowAccountForm(!props.showAccountForm)} className="cursor-pointer">
                                <LiquidMetalButton
                                    viewMode="icon"
                                    icon={<Plus size={20} className={`text-white transition-transform ${props.showAccountForm ? 'rotate-45' : ''}`} />}
                                />
                            </div>
                        </div>

                        {/* FORMULÁRIO */}
                        <AnimatePresence initial={false}>
                            {props.showAccountForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, scale: 0.95 }}
                                    animate={{
                                        height: "auto",
                                        opacity: 1,
                                        scale: 1,
                                        transition: {
                                            height: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 }
                                        }
                                    }}
                                    exit={{
                                        height: 0,
                                        opacity: 0,
                                        scale: 0.95,
                                        transition: {
                                            height: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.1 }
                                        }
                                    }}
                                    className="overflow-hidden mt-4 sm:mt-6 lg:mt-6"
                                >
                                    <div className="p-3 sm:p-4 lg:p-4 bg-[#42504d]/10 border border-[#607585]/20 rounded-xl space-y-3 mb-4 sm:mb-6 lg:mb-6 shadow-inner">
                                        <div className="space-y-1">
                                            <label htmlFor="instance-name" className="text-[10px] uppercase tracking-widest text-[#7cb8c7]/60 ml-1">
                                                Nome da Instância
                                            </label>
                                            <input
                                                id="instance-name"
                                                type="text"
                                                placeholder="Ex: Produção"
                                                value={props.accountForm.name}
                                                onChange={(e) => {
                                                    props.setAccountForm({ ...props.accountForm, name: e.target.value })
                                                    setFormErrors({ ...formErrors, name: '' })
                                                }}
                                                className={`w-full px-3 py-2 bg-[#101719]/80 border rounded-lg text-sm text-white focus:border-[#7cb8c7] focus:ring-1 focus:ring-[#7cb8c7] outline-none transition-all ${formErrors.name ? 'border-red-500/50' : 'border-[#607585]/30'
                                                    }`}
                                            />
                                            {formErrors.name && (
                                                <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.name}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="base-url" className="text-[10px] uppercase tracking-widest text-[#7cb8c7]/60 ml-1">
                                                URL Base
                                            </label>
                                            <input
                                                id="base-url"
                                                type="text"
                                                placeholder="https://n8n.suaempresa.com"
                                                value={props.accountForm.base_url}
                                                onChange={(e) => {
                                                    props.setAccountForm({ ...props.accountForm, base_url: e.target.value })
                                                    setFormErrors({ ...formErrors, base_url: '' })
                                                }}
                                                className={`w-full px-3 py-2 bg-[#101719]/80 border rounded-lg text-sm text-white focus:border-[#7cb8c7] outline-none transition-all ${formErrors.base_url ? 'border-red-500/50' : 'border-[#607585]/30'
                                                    }`}
                                            />
                                            {formErrors.base_url && (
                                                <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.base_url}</p>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <label htmlFor="api-key" className="text-[10px] uppercase tracking-widest text-[#7cb8c7]/60 ml-1">
                                                Chave API
                                            </label>
                                            <input
                                                id="api-key"
                                                type="password"
                                                placeholder="Key"
                                                value={props.accountForm.api_key}
                                                onChange={(e) => {
                                                    props.setAccountForm({ ...props.accountForm, api_key: e.target.value })
                                                    setFormErrors({ ...formErrors, api_key: '' })
                                                }}
                                                className={`w-full px-3 py-2 bg-[#101719]/80 border rounded-lg text-sm text-white focus:border-[#7cb8c7] outline-none transition-all ${formErrors.api_key ? 'border-red-500/50' : 'border-[#607585]/30'
                                                    }`}
                                            />
                                            {formErrors.api_key && (
                                                <p className="text-red-400 text-xs mt-1 ml-1">{formErrors.api_key}</p>
                                            )}
                                        </div>
                                        <div className="flex justify-center pt-2 cursor-pointer">
                                            <div onClick={handleCreateAccount}>
                                                <LiquidMetalButton
                                                    label={props.accountLoading ? 'Processando...' : 'Adicionar'}
                                                    onClick={handleCreateAccount}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2 sm:space-y-3 lg:space-y-3">
                            {props.accounts.map((acc: N8nAccount) => (
                                <motion.div
                                    layout
                                    key={acc.id}
                                    onClick={() => props.setSelectedAccount(acc)}
                                    className={`group flex items-center justify-between p-3 sm:p-4 lg:p-4 border rounded-xl cursor-pointer transition-all ${props.selectedAccount?.id === acc.id
                                        ? 'border-[#7cb8c7] bg-[#7cb8c7]/10 shadow-[0_0_15px_rgba(124,184,199,0.1)]'
                                        : 'border-[#607585]/20 hover:border-[#7cb8c7]/40 bg-white/5'
                                        }`}
                                >
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className={`font-bold text-xs sm:text-sm lg:text-sm truncate ${props.selectedAccount?.id === acc.id ? 'text-[#7cb8c7]' : 'text-white'}`}>
                                            {acc.name}
                                        </h3>
                                        <p className="text-[10px] text-white/40 truncate mt-1 font-mono">{acc.base_url}</p>
                                    </div>
                                    <div onClick={(e) => { e.stopPropagation(); props.deleteAccount(acc.id); }} className="cursor-pointer flex items-center">
                                        <LiquidMetalButton
                                            viewMode="icon"
                                            icon={<Trash2 size={16} className="text-white" />}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ============= MAIN CONTENT ============= */}
                <section className="lg:col-span-8 space-y-4 sm:space-y-6 lg:space-y-6">
                    {/* Barra de Busca */}
                    <div className="backdrop-blur-xl bg-[#101719]/40 border border-[#7cb8c7]/20 rounded-2xl p-4 sm:p-5 lg:p-7 flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-4 items-stretch sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7cb8c7]/40 w-4 sm:w-5 lg:w-5 h-4 sm:h-5 lg:h-5" />
                            <input
                                type="text"
                                value={props.searchTerm}
                                onChange={(e) => props.setSearchTerm(e.target.value)}
                                placeholder="Pesquisar workflows..."
                                className="w-full pl-9 sm:pl-10 lg:pl-10 pr-4 py-2 sm:py-3 lg:py-3 bg-[#101719]/60 border border-[#607585]/20 rounded-xl text-xs sm:text-sm lg:text-sm text-white focus:border-[#7cb8c7] outline-none transition-all"
                            />
                        </div>
                        <div onClick={props.loadWorkflows} className="cursor-pointer flex justify-center">
                            <LiquidMetalButton
                                label="Sincronizar"
                                icon={<RefreshCw size={16} className={`text-white transition-transform ${props.workflowLoading ? 'animate-spin' : ''}`} />}
                            />
                        </div>
                    </div>

                    {/* Lista de Workflows */}
                    <motion.div layout className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-3">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((w: Workflow) => (
                                <motion.div
                                    layout
                                    key={w.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="backdrop-blur-xl bg-[#101719]/40 border border-[#7cb8c7]/20 rounded-2xl p-3 sm:p-4 lg:p-5 flex items-center justify-between hover:border-[#7cb8c7]/50 transition-all group"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                                        <div className={`p-2 sm:p-3 lg:p-3 rounded-xl transition-all shrink-0 ${w.active ? 'bg-[#7cb8c7] text-white shadow-[0_0_15px_rgba(124,184,199,0.4)]' : 'bg-[#101719] text-white/20 border border-white/5'}`}>
                                            <Zap size={16} className={`sm:w-5 sm:h-5 lg:w-5 lg:h-5 ${w.active ? "animate-pulse" : ""}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm sm:text-base lg:text-base text-white group-hover:text-[#7cb8c7] transition-colors truncate">{w.name}</h3>
                                            <p className="text-[10px] text-white/30 font-mono tracking-tighter truncate">ID: {w.id}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => props.toggleWorkflow(w.id, w.active)}
                                        disabled={props.toggling === w.id}
                                        className={`relative inline-flex h-6 w-11 sm:h-7 sm:w-12 lg:h-7 lg:w-12 items-center rounded-full transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shrink-0 ml-2 ${w.active ? 'bg-linear-to-r from-[#7cb8c7] to-[#607585]' : 'bg-white/10'
                                            }`}
                                    >
                                        <motion.span
                                            animate={{ x: w.active ? (window.innerWidth < 640 ? 22 : 24) : 4 }}
                                            className="inline-block h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 transform rounded-full bg-white shadow-lg"
                                        />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </section>
            </div>
        </motion.div>
    )
}