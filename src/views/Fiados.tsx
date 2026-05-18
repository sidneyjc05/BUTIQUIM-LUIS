import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatMoney, formatNumber, formatDate } from '../lib/utils';
import { HandCoins, Plus, Phone, Trash2, Edit2, User, Check, X } from 'lucide-react';

export function Fiados({ search }: { search: string }) {
  const { fiados, updateFiado, removeFiado, addTransacao } = useStore();
  const [view, setView] = useState<'list' | 'form-novo' | 'form-pagar'>('list');
  
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedF, setSelectedF] = useState<any>(null);
  const [valorPago, setValorPago] = useState('');

  let list = fiados.filter(f => f.status === 'pendente');
  if (search) {
    list = list.filter(f => f.cliente.toLowerCase().includes(search.toLowerCase()));
  }

  const salvarNovo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateFiado({
        id: Date.now().toString(),
        cliente: nome,
        telefone: telefone,
        itens: [],
        valor: 0,
        pago: 0,
        status: 'pendente',
        data: new Date().toISOString()
      });
      setView('list');
      setNome('');
      setTelefone('');
      alert('Cliente cadastrado!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReceber = (f: any) => {
    setSelectedF(f);
    setValorPago('');
    setView('form-pagar');
  };

  const confirmarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedF) return;
    const v = parseFloat(valorPago);
    if (!v || v <= 0) return alert('Valor inválido');
    
    selectedF.pago += v;
    if (selectedF.pago >= selectedF.valor) selectedF.status = 'pago';
    
    await updateFiado(selectedF);
    await addTransacao({
      id: Date.now().toString(),
      tipo: 'pagamento',
      descricao: `Pagamento de ${selectedF.cliente}`,
      valor: v,
      data: new Date().toISOString(),
      cliente: selectedF.cliente
    });
    setView('list');
    alert('Pagamento recebido com sucesso!');
  };

  if (view === 'form-novo') {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto w-full animate-fade-in pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-2 rounded-full border border-border bg-white text-text-dark hover:bg-surface-2 transition-colors shadow-sm">
            <X size={20} />
          </button>
          <h2 className="font-bold text-2xl text-text-dark">Novo Cliente Fiado</h2>
        </div>
        <form onSubmit={salvarNovo} className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-6">
          <div>
            <label className="text-sm font-bold text-text-dark block">Nome do Cliente</label>
            <input autoFocus required type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full mt-2 bg-surface-2 border border-border p-4 rounded-xl focus:bg-white focus:border-primary focus:outline-none placeholder:text-text-muted/50 font-medium transition-colors" placeholder="Ex: João da Silva" />
          </div>
          <div>
            <label className="text-sm font-bold text-text-dark flex items-center gap-2 mb-2">Telefone <span className="text-text-muted font-normal">(opcional)</span></label>
            <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)} className="w-full mt-2 bg-surface-2 border border-border p-4 rounded-xl focus:bg-white focus:border-primary focus:outline-none placeholder:text-text-muted/50 font-medium transition-colors" placeholder="(00) 00000-0000" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-md shadow-primary/20 transition-all text-base mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Cliente'}
          </button>
        </form>
      </div>
    );
  }

  if (view === 'form-pagar' && selectedF) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto w-full animate-fade-in pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-2 rounded-full border border-border bg-white text-text-dark hover:bg-surface-2 transition-colors shadow-sm">
            <X size={20} />
          </button>
          <h2 className="font-bold text-2xl text-text-dark">Receber Pagamento</h2>
        </div>
        <form onSubmit={confirmarPagamento} className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm space-y-6">
          <div className="text-center p-6 bg-surface-2 border border-border rounded-2xl">
            <div className="text-lg font-bold text-text-dark mb-1">{selectedF.cliente}</div>
            <div className="text-[0.7rem] text-text-medium uppercase font-bold tracking-wider mb-2">Dívida Atual</div>
            <div className="text-4xl md:text-5xl font-black text-warning tracking-tight drop-shadow-sm">{formatMoney(selectedF.valor - selectedF.pago)}</div>
          </div>
          
          <div>
            <label className="text-sm font-bold text-text-dark block text-center mb-3">Qual o valor recebido?</label>
            <input autoFocus required type="number" step="0.01" value={valorPago} onChange={e => setValorPago(e.target.value)} className="w-full font-black text-4xl text-center bg-surface-2 border border-border p-6 rounded-2xl focus:bg-white focus:border-primary focus:outline-none transition-colors" placeholder="0.00" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button type="button" onClick={() => setValorPago((selectedF.valor - selectedF.pago).toString())} className="flex-1 py-4 rounded-xl border-2 border-border font-bold text-text-dark hover:bg-surface-2 hover:border-text-medium transition-all">Quitar Tudo</button>
            <button type="submit" className="flex-1 py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2">
              <Check size={20} /> Confirmar Pagamento
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full animate-fade pb-24">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-text-dark">
          <div className="w-12 h-12 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shadow-sm">
            <User size={24} />
          </div>
          Contas a Receber
        </h2>
        <button onClick={() => { setNome(''); setTelefone(''); setView('form-novo'); }} className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 hover:bg-primary-dark shadow-md shadow-primary/20 transition-all">
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {list.length === 0 ? (
          <div className="col-span-1 md:col-span-2 text-center p-12 bg-white border border-border rounded-2xl text-text-muted">
            <div className="mb-4 flex justify-center opacity-50"><HandCoins size={48} /></div>
            <p className="text-lg font-medium">Nenhum cliente com fiado ativo.</p>
            <p className="text-sm mt-1 opacity-70">Adicione um novo cliente para começar a vender fiado.</p>
          </div>
        ) : (
          list.map(f => (
            <div key={f.id} className="bg-white rounded-3xl border border-border p-6 hover:border-text-medium hover:shadow-md transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="font-bold text-lg flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-light text-primary-dark flex items-center justify-center font-bold text-lg border border-primary/20">
                    {f.cliente.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-text-dark font-extrabold">{f.cliente}</div>
                    {f.telefone && <div className="text-xs text-text-medium font-medium mt-0.5 flex items-center gap-1"><Phone size={12}/> {f.telefone}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[0.65rem] text-text-muted uppercase font-bold tracking-wider mb-0.5">Dívida</div>
                  <div className="text-2xl font-black text-warning tracking-tight">
                    {formatMoney(f.valor - f.pago)}
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-surface-2 rounded-2xl p-4 text-xs text-text-medium font-medium mb-5 max-h-48 overflow-y-auto border border-border shadow-inner space-y-3">
                {f.itens && f.itens.length > 0 ? (
                  f.itens.map((i:any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-1.5 border-b border-border/60 last:border-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-text-dark line-clamp-2">{i.nome}</span>
                        <span className="font-bold text-text-dark whitespace-nowrap">{formatMoney(i.subtotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[0.65rem] text-text-muted">
                        <span className="bg-white px-2 py-1 rounded-md shadow-sm border border-border/50 font-bold text-text-dark">
                          {formatNumber(i.qtd)} {i.tipoVenda==='peso'?'kg':'un'}
                        </span>
                        <span className="flex items-center text-text-medium font-semibold bg-white/50 px-2 py-1 rounded-md">
                          {i.dataCompra ? formatDate(i.dataCompra) + ' às ' + new Date(i.dataCompra).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : new Date(f.data).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 opacity-50">
                    <div className="mb-2"><User size={24} /></div>
                    <p className="text-center">Nenhum item registrado</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 flex-wrap mt-auto">
                <button onClick={() => openReceber(f)} className="flex-1 min-w-[120px] py-3 rounded-xl bg-surface border-2 border-border text-text-dark font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                   <HandCoins size={18} /> Receber
                </button>
                <button onClick={() => removeFiado(f.id)} className="w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center bg-surface border-2 border-border text-text-muted hover:bg-danger-light hover:text-danger hover:border-danger transition-all shadow-sm group-hover:opacity-100 opacity-60">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BookOpenIcon() {
  return <HandCoins size={48} className="mx-auto opacity-20" />;
}
