import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatMoney, formatDate, cn } from '../lib/utils';
import { Receipt, TrendingUp, TrendingDown, BookOpen, Wallet, Filter, Check } from 'lucide-react';

export function Extrato({ search }: { search: string }) {
  const { transacoes } = useStore();
  const [filtro, setFiltro] = useState('todos');

  let filtered = [...transacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  
  if (filtro !== 'todos') {
    filtered = filtered.filter(t => t.tipo === filtro);
  }
  
  if (search) {
    filtered = filtered.filter(t => 
      (t.descricao || '').toLowerCase().includes(search.toLowerCase()) || 
      (t.cliente || '').toLowerCase().includes(search.toLowerCase())
    );
  }

  // Group by date
  const grouped = filtered.reduce((acc, t) => {
    const data = t.data.split('T')[0];
    if (!acc[data]) acc[data] = [];
    acc[data].push(t);
    return acc;
  }, {} as Record<string, typeof transacoes>);

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'venda', label: 'Vendas' },
    { id: 'despesa', label: 'Despesas' },
    { id: 'recebimento', label: 'Recebimentos' },
    { id: 'fiado', label: 'Fiados' },
    { id: 'pagamento', label: 'Pagamentos' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full animate-fade pb-24">
      <div className="flex items-center gap-3 text-text-dark font-bold text-xl mb-6">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shadow-sm">
          <Receipt size={20} />
        </div>
        Extrato Completo
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none items-center">
        <Filter size={18} className="text-text-muted mr-2 shrink-0" />
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setFiltro(t.id)}
            className={cn(
               "px-4 py-2 rounded-full font-semibold text-sm shrink-0 border transition-all",
               filtro === t.id 
                 ? "bg-primary border-primary text-white shadow-sm"
                 : "bg-white border-border text-text-muted hover:border-text-medium hover:text-text-dark"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center p-12 bg-white text-text-muted rounded-2xl border border-border">
             <Receipt size={48} className="mx-auto mb-4 opacity-20" />
             <p>Nenhuma movimentação encontrada.</p>
          </div>
        ) : (
          Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(date => (
            <div key={date}>
              <div className="text-xs font-semibold text-text-medium uppercase tracking-wider mb-3 flex items-center gap-2">
                 <span>{new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
                 <div className="flex-1 h-px bg-border flex-shrink" />
              </div>
              <div className="space-y-3">
                 {grouped[date].map(t => <TransactionItem key={t.id} tx={t} />)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TransactionItem({ tx }: { tx: any, key?: React.Key }) {
  const isSaida = tx.tipo === 'despesa';
  const isVenda = tx.tipo === 'venda';
  const isFiado = tx.tipo === 'fiado';
  const isPagamento = tx.tipo === 'pagamento';

  let color = "text-text-dark";
  let bgIcon = "bg-surface-2 text-text-medium";
  let IconComponent = Receipt;
  let sign = "+";
  let label = "Transação";

  if (isVenda) { color = "text-primary"; bgIcon = "bg-primary-light text-primary"; IconComponent = TrendingUp; label = "Venda"; }
  else if (isSaida) { color = "text-danger"; bgIcon = "bg-danger-light text-danger"; IconComponent = TrendingDown; sign = "-"; label = "Despesa"; }
  else if (isFiado) { color = "text-warning"; bgIcon = "bg-warning-light text-warning"; IconComponent = BookOpen; label = "Fiado"; }
  else if (isPagamento) { color = "text-secondary"; bgIcon = "bg-secondary-light text-secondary"; IconComponent = Check; label = "Pagamento"; }
  else { color = "text-info"; bgIcon = "bg-info-light text-info"; IconComponent = Wallet; label = "Recebimento"; }

  return (
    <div className="bg-white p-4 rounded-xl border border-border flex items-center gap-4 group hover:border-text-medium hover:shadow-sm transition-all">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", bgIcon)}>
        <IconComponent size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-text-dark truncate mb-1">{tx.descricao}</div>
        <div className="flex flex-wrap gap-2 text-xs text-text-muted items-center">
          <span className={cn("px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[0.65rem]", bgIcon)}>{label}</span>
          <span>{formatDate(tx.data)}</span>
        </div>
      </div>
      <div className={cn("font-bold whitespace-nowrap", color)}>
        {sign} {formatMoney(tx.valor)}
      </div>
    </div>
  );
}
