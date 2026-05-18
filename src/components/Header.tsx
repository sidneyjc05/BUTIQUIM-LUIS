import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { RotateCw, Settings, Search } from 'lucide-react';

export function Header({ search, setSearch }: { search: string, setSearch: (s: string) => void }) {
  const { nav, forceRefresh, setNav } = useStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const titles: Record<string, [string, string]> = {
    inicio: ['Painel de Controle', 'Gestão de Inventário e Fluxo de Caixa'],
    caixa: ['Caixa Rápido', 'Registre vendas com facilidade'],
    produtos: ['Produtos', 'Cadastro e gestão'],
    estoque: ['Estoque', 'Controle de mercadoria'],
    fiados: ['Fiados', 'Contas a receber'],
    extrato: ['Extrato', 'Todas as movimentações'],
    relatorios: ['Relatórios', 'Análise financeira'],
  };

  const [title, subtitle] = titles[nav] || titles.inicio;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await forceRefresh();
    setTimeout(() => setIsRefreshing(false), 500); // minimum visual feedback time
  };

  return (
    <header className="bg-primary text-white p-6 md:p-8 flex flex-col gap-6 shrink-0 z-20 rounded-b-3xl shadow-md">
      <div className="flex justify-between items-start w-full max-w-7xl mx-auto">
        <div className="mt-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">{title}</h1>
          <p className="text-white/80 font-medium mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <div className="hidden md:flex bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 items-center gap-3">
             <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
             <span className="text-sm font-semibold text-white">Estoque em Alerta</span>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all shadow-sm text-white disabled:opacity-50"
            title="Atualizar dados"
          >
            <RotateCw size={20} className={isRefreshing ? "animate-spin text-white" : ""} />
          </button>
          <button onClick={() => setNav('settings')} className="w-12 h-12 rounded-2xl bg-white/20 border border-white/20 flex items-center justify-center hover:bg-white/30 transition-all shadow-sm text-white">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto bg-white rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md border-none focus-within:ring-4 focus-within:ring-white/30 transition-all text-text-dark mt-2 mb-2">
        <Search size={22} className="text-text-medium" />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar transação, produto ou cliente..." 
          className="bg-transparent border-none outline-none w-full text-text-dark font-medium placeholder:text-text-muted placeholder:font-normal"
        />
      </div>
    </header>
  );
}
