import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Produto } from '../types';
import { formatMoney, formatNumber, formatWeight } from '../lib/utils';
import { Box, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export function Produtos({ search }: { search: string }) {
  const { produtos, updateProduto, removeProduto } = useStore();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Produto>>({
    nome: '', categoria: 'Bebidas', precoCusto: 0, precoVenda: 0, 
    estoqueCaixas: 0, estoqueMinimo: 5, 
    vendeUnidade: false, unidadesPorCaixa: 1, precoUnitario: 0,
    vendePeso: false, precoKilo: 0
  });

  const prods = search 
    ? produtos.filter(p => p.nome.toLowerCase().includes(search.toLowerCase())) 
    : produtos;

  const openNew = () => {
    setEditingId(null);
    setFormData({ nome: '', categoria: 'Bebidas', precoCusto: 0, precoVenda: 0, estoqueCaixas: 0, estoqueMinimo: 5, vendeUnidade: false, unidadesPorCaixa: 1, precoUnitario: 0, vendePeso: false, precoKilo: 0 });
    setView('form');
  };

  const openEdit = (p: Produto) => {
    setEditingId(p.id);
    setFormData({ ...p });
    setView('form');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const p: Produto = {
        id: editingId || Date.now().toString(),
        nome: formData.nome || '',
        icon: 'fa-box',
        categoria: formData.categoria || 'Outros',
        precoCusto: Number(formData.precoCusto),
        precoVenda: Number(formData.precoVenda),
        estoqueCaixas: Number(formData.estoqueCaixas),
        estoqueUnidades: formData.estoqueUnidades || 0,
        estoquePeso: formData.estoquePeso || 0,
        estoqueMinimo: Number(formData.estoqueMinimo),
        vendeUnidade: !!formData.vendeUnidade,
        unidadesPorCaixa: Number(formData.unidadesPorCaixa),
        precoUnitario: Number(formData.precoUnitario),
        vendePeso: !!formData.vendePeso,
        precoKilo: Number(formData.precoKilo)
      };
      await updateProduto(p);
      setView('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'form') {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto w-full animate-fade-in pb-24">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('list')} className="p-2 rounded-full bg-surface-2 hover:bg-surface-3 transition-colors">
            <X size={20} />
          </button>
          <h2 className="font-bold text-xl">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
        </div>

        <form onSubmit={save} className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-6">
           <div className="space-y-1">
            <label className="text-xs font-medium text-text-medium block">Nome do Produto</label>
            <input autoFocus required type="text" value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none text-sm font-medium" placeholder="Ex: Cerveja Lata" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-medium block">Preço Custo (Caixa)</label>
              <input required type="number" step="0.01" value={formData.precoCusto} onChange={e => setFormData({...formData, precoCusto: e.target.value})} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none text-sm font-medium" placeholder="0.00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-medium block">Preço Venda (Caixa)</label>
              <input required type="number" step="0.01" value={formData.precoVenda} onChange={e => setFormData({...formData, precoVenda: e.target.value})} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none text-sm font-medium" placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-medium block">Estoque (Caixas)</label>
              <input required type="number" value={formData.estoqueCaixas} onChange={e => setFormData({...formData, estoqueCaixas: e.target.value})} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none text-sm font-medium" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-medium block">Estoque Min. (Caixas)</label>
              <input required type="number" value={formData.estoqueMinimo} onChange={e => setFormData({...formData, estoqueMinimo: e.target.value})} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none text-sm font-medium" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-text-medium block">Categoria</label>
            <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none text-sm font-medium">
              {['Bebidas','Alimentos','Limpeza','Higiene','Tabaco','Outros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="border border-border rounded-xl p-4 bg-surface mt-4 space-y-4">
             <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.vendeUnidade} onChange={e => setFormData({...formData, vendeUnidade: e.target.checked})} className="w-4 h-4 accent-primary" />
                <span className="font-semibold text-sm">Vende por unidade quebrada? (Ex: Lata avulsa)</span>
             </label>
             {formData.vendeUnidade && (
               <div className="grid grid-cols-2 gap-4 pl-7">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-medium block">Unidades p/ Caixa</label>
                    <input required type="number" value={formData.unidadesPorCaixa} onChange={e => setFormData({...formData, unidadesPorCaixa: e.target.value})} className="w-full bg-white border border-border p-2.5 rounded-lg focus:border-primary text-sm font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-medium block">Preço Unidade R$</label>
                    <input required type="number" step="0.01" value={formData.precoUnitario} onChange={e => setFormData({...formData, precoUnitario: e.target.value})} className="w-full bg-white border border-border p-2.5 rounded-lg focus:border-primary text-sm font-medium" />
                  </div>
               </div>
             )}

             <hr className="border-border" />

             <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.vendePeso} onChange={e => setFormData({...formData, vendePeso: e.target.checked})} className="w-4 h-4 accent-primary" />
                <span className="font-semibold text-sm">Vende a granel / por peso (kg)?</span>
             </label>
             {formData.vendePeso && (
               <div className="grid grid-cols-2 gap-4 pl-7">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-medium block">Valor por Quilo (R$)</label>
                    <input required type="number" step="0.01" value={formData.precoKilo} onChange={e => setFormData({...formData, precoKilo: e.target.value})} className="w-full bg-white border border-border p-2.5 rounded-lg focus:border-primary text-sm font-medium" />
                  </div>
               </div>
             )}
          </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors text-base mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Check size={18} /> {isSubmitting ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Cadastrar Produto')}
            </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full animate-fade pb-24">
       <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold flex items-center gap-3 text-text-dark">
            <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <Box size={22} />
            </div>
            Meus Produtos
          </h2>
          <button onClick={openNew} className="bg-primary text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-colors">
            <Plus size={18} /> Novo  
          </button>
       </div>

       <div className="flex flex-col gap-3">
         {prods.length === 0 ? (
            <div className="text-center p-12 bg-white border border-border rounded-2xl text-text-muted">
              <Box size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum produto encontrado</p>
            </div>
         ) : (
            prods.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-xl border border-border flex items-center gap-4 hover:shadow-sm hover:border-text-medium transition-all group">
                 <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center text-text-dark group-hover:bg-primary group-hover:text-white transition-all flex-shrink-0">
                    <Box size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="font-bold text-text-dark text-base">{p.nome}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-text-muted">
                      <span>{p.categoria}</span>
                      <span className="font-medium text-text-medium">• Estq: {formatNumber(p.estoqueCaixas)} cx</span>
                      {p.vendeUnidade && <span className="text-secondary">• Total Unidades: {formatNumber(p.estoqueCaixas * (p.unidadesPorCaixa || 1) + (p.estoqueUnidades || 0))}</span>}
                      {p.vendePeso && <span className="text-warning">• Saldo Peso: {formatWeight(p.estoquePeso || 0)}</span>}
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="font-bold text-text-dark text-lg">{formatMoney(p.precoVenda)}<span className="text-xs font-normal text-text-muted">/cx</span></div>
                    {p.vendeUnidade && <div className="text-xs font-semibold text-secondary">Un: {formatMoney(p.precoUnitario)}</div>}
                    {p.vendePeso && <div className="text-xs font-semibold text-warning">Kg: {formatMoney(p.precoKilo)}</div>}
                 </div>
                 <div className="flex flex-col gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} className="p-2 rounded-md text-text-muted hover:bg-surface-2 hover:text-text-dark"><Edit2 size={16}/></button>
                    <button onClick={() => removeProduto(p.id)} className="p-2 rounded-md text-text-muted hover:bg-danger-light hover:text-danger"><Trash2 size={16}/></button>
                 </div>
              </div>
            ))
         )}
       </div>
    </div>
  );
}