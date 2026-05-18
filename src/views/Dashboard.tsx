import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatMoney, formatNumber, formatDate } from '../lib/utils';
import { TrendingUp, TrendingDown, Coins, BookOpen, Wallet, CalendarDays, Zap, AlertTriangle, Receipt, Boxes, Box, ArrowRight, Plus, Minus, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { transacoes, fiados, produtos, settings, setNav, addTransacao } = useStore();
  
  const [modalType, setModalType] = useState<'recebimento' | 'despesa' | null>(null);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');

  const hoje = new Date().toISOString().split('T')[0];
  const hojeTrans = transacoes.filter(t => t.data.startsWith(hoje));
  const vendas = hojeTrans.filter(t => t.tipo === 'venda').reduce((s, t) => s + t.valor, 0);
  const saidas = hojeTrans.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
  const recebimentos = hojeTrans.filter(t => t.tipo === 'recebimento').reduce((s, t) => s + t.valor, 0);
  const custoVendas = hojeTrans.filter(t => t.tipo === 'venda').reduce((s, t) => s + (t.custoTotal || 0), 0);
  
  const lucro = vendas - custoVendas;
  const fiadoAtivo = fiados.filter(f => f.status === 'pendente').reduce((s, f) => s + (f.valor - f.pago), 0);
  const caixa = (settings.saldoInicial || 0) + vendas + recebimentos - saidas;

  // Limitation requested by User: 5 messages for últimas movimentações and add button "Ver mais"
  const ultimasTransacoes = [...transacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);
  
  // Limitation requested by User: 5 messages for estoque baixo and add button "Ver mais"
  const estoqueBaixo = produtos.filter(p => p.estoqueCaixas <= (p.estoqueMinimo || 5)).slice(0, 5);

  const handleSaveTx = () => {
    const numValor = parseFloat(valor);
    if (isNaN(numValor) || numValor <= 0) return alert('Valor inválido');
    if (!descricao) return alert('Descrição obrigatória');

    addTransacao({
      id: crypto.randomUUID(),
      tipo: modalType as any,
      valor: numValor,
      descricao: descricao,
      data: new Date().toISOString()
    });

    setModalType(null);
    setValor('');
    setDescricao('');
  };

  return (
    <>
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade pb-32 md:pb-24 relative">
      <div className="flex items-center gap-3 text-text-dark font-bold text-xl mb-4">
        <div className="w-10 h-10 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shadow-sm">
          <CalendarDays size={20} />
        </div>
        Hoje
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <SummaryCard icon={TrendingUp} label="Vendas Hoje" value={formatMoney(vendas)} color="text-primary" bg="bg-primary-light" />
        <SummaryCard icon={TrendingDown} label="Saídas Hoje" value={formatMoney(saidas)} color="text-danger" bg="bg-danger-light" />
        <SummaryCard icon={Coins} label="Lucro Hoje" value={formatMoney(lucro)} color="text-[#7C4DFF]" bg="bg-[#EDE7F6]" />
        <SummaryCard icon={BookOpen} label="Fiado Ativo" value={formatMoney(fiadoAtivo)} color="text-warning" bg="bg-warning-light" className="hidden md:flex" />
        <SummaryCard icon={Wallet} label="Saldo Caixa" value={formatMoney(caixa)} color="text-secondary" bg="bg-secondary-light" className="col-span-2 md:col-span-1" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-text-dark font-bold text-lg">
            <div className="w-10 h-10 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shadow-sm">
              <Zap size={20} />
            </div>
            Últimas Movimentações
          </div>
          <button onClick={() => setNav('extrato')} className="flex items-center gap-1 text-sm font-semibold text-primary hover:bg-surface-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-border transition-colors">
            Ver mais <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {ultimasTransacoes.length === 0 ? (
            <div className="text-center p-12 text-text-muted bg-white border border-border rounded-xl">
              <Receipt className="mx-auto mb-4 opacity-20" size={48} />
              <p className="font-semibold text-text-medium">Nenhuma movimentação hoje</p>
              <p className="text-sm mt-1">Use o Caixa Rápido para registrar sua primeira venda</p>
            </div>
          ) : (
            ultimasTransacoes.map((t) => <TransactionItem key={t.id} tx={t} />)
          )}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-text-dark font-bold text-lg">
            <div className="w-10 h-10 rounded-xl bg-surface border border-border text-warning flex items-center justify-center shadow-sm">
              <AlertTriangle size={20} />
            </div>
            Estoque Baixo
          </div>
          <button onClick={() => setNav('estoque')} className="flex items-center gap-1 text-sm font-semibold text-warning hover:bg-surface-2 px-3 py-1.5 rounded-lg border border-transparent hover:border-border transition-colors">
            Ver mais <ArrowRight size={16} />
          </button>
        </div>

        <div className="space-y-3">
          {estoqueBaixo.length === 0 ? (
            <div className="text-center p-8 text-text-muted bg-white border border-border rounded-xl">
              <Boxes className="mx-auto mb-2 opacity-20" size={36} />
              <p className="text-sm">Nenhum produto com estoque baixo</p>
            </div>
          ) : (
            estoqueBaixo.map((p) => (
              <div key={p.id} onClick={() => setNav('estoque')} className="bg-white p-4 rounded-xl border border-border flex items-center gap-4 cursor-pointer hover:border-warning-light hover:shadow-sm transition-all group">
                <div className="w-12 h-12 rounded-lg bg-surface-2 text-danger flex items-center justify-center group-hover:bg-danger-light transition-colors">
                  <Box size={24} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-text-dark truncate leading-tight">{p.nome}</div>
                  <div className="text-xs text-text-muted mt-1">{p.categoria} | Estoque: {formatNumber(p.estoqueCaixas)} emb</div>
                </div>
                <div className="text-danger font-bold text-sm bg-danger-light px-2.5 py-1 rounded-md">
                  {formatNumber(p.estoqueCaixas)} rest.
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      </div>

      {/* Fixed Action Buttons */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setModalType('recebimento')}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="Nova Entrada"
        >
          <Plus size={28} />
        </button>
        <button 
          onClick={() => setModalType('despesa')}
          className="w-14 h-14 bg-danger text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="Nova Despesa"
        >
          <Minus size={28} />
        </button>
      </div>

      {/* Modal for + / - */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className={`p-4 text-white flex items-center justify-between ${modalType === 'recebimento' ? 'bg-primary' : 'bg-danger'}`}>
              <h3 className="font-bold text-lg">
                {modalType === 'recebimento' ? 'Registrar Entrada' : 'Registrar Despesa'}
              </h3>
              <button onClick={() => setModalType(null)} className="text-white/80 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-medium mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-medium mb-1">Descrição</label>
                <input
                  type="text"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Ex: Pagamento de conta"
                />
              </div>
              <button
                onClick={handleSaveTx}
                className={`w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors mt-2`}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg, className }: any) {
  return (
    <div className={cn("bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-center relative overflow-hidden group cursor-default", className)}>
      <div className={cn("text-xl md:text-2xl font-bold mb-2 flex items-center gap-2", color)}>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
          <Icon size={20} />
        </div>
        {value}
      </div>
      <div className="text-xs font-semibold text-text-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}

function TransactionItem({ tx }: { tx: any }) {
  const isSaida = tx.tipo === 'despesa';
  const isVenda = tx.tipo === 'venda';
  const isFiado = tx.tipo === 'fiado';
  const isPagamento = tx.tipo === 'pagamento';
  const isEntrada = tx.tipo === 'recebimento';

  let color = "text-text-dark";
  let bgIcon = "bg-surface-2 text-text-medium";
  let IconComponent = Receipt;
  let sign = "+";

  if (isVenda) { color = "text-primary"; bgIcon = "bg-primary-light text-primary"; IconComponent = TrendingUp; }
  else if (isSaida) { color = "text-danger"; bgIcon = "bg-danger-light text-danger"; IconComponent = TrendingDown; sign = "-"; }
  else if (isFiado) { color = "text-warning"; bgIcon = "bg-warning-light text-warning"; IconComponent = BookOpen; }
  else if (isPagamento || isEntrada) { color = "text-secondary"; bgIcon = "bg-secondary-light text-secondary"; IconComponent = Wallet; }

  return (
    <div className="bg-white p-4 rounded-xl border border-border flex items-center gap-4 group hover:border-text-medium hover:shadow-sm transition-all">
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors", bgIcon)}>
        <IconComponent size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-text-dark truncate mb-1">{tx.descricao}</div>
        <div className="flex flex-wrap gap-2 text-xs text-text-muted items-center">
          <span className={cn("px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[0.65rem]", bgIcon)}>{tx.tipo}</span>
          <span>{formatDate(tx.data)}</span>
        </div>
      </div>
      <div className={cn("font-bold whitespace-nowrap", color)}>
        {sign} {formatMoney(tx.valor)}
      </div>
    </div>
  );
}
