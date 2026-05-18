import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatMoney, formatNumber, formatWeight } from '../lib/utils';
import { Warehouse, Plus, Box } from 'lucide-react';
import { cn } from '../lib/utils';

export function Estoque({ search }: { search: string }) {
  const { produtos, updateProduto, addTransacao } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedP, setSelectedP] = useState<any>(null);
  const [qtd, setQtd] = useState('');
  const [custo, setCusto] = useState('');

  const prods = search 
    ? produtos.filter(p => p.nome.toLowerCase().includes(search.toLowerCase())) 
    : produtos;

  const openRepor = (p: any) => {
    setSelectedP(p);
    setQtd('');
    setCusto('');
    setModalOpen(true);
  };

  const salvarRepor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedP) return;
    
    const qtyN = parseFloat(qtd);
    if (!qtyN || qtyN <= 0) return alert('Quantidade inválida');
    
    const updated = { ...selectedP };
    
    if (selectedP.vendePeso) {
      updated.estoquePeso += qtyN;
    } else {
      updated.estoqueCaixas += qtyN;
    }
    
    updated.precoCusto = parseFloat(custo) || 0;

    await updateProduto(updated);
    
    await addTransacao({
      id: Date.now().toString(),
      tipo: 'despesa',
      descricao: `Compra: ${updated.nome} (${qtyN} ${selectedP.vendePeso ? 'kg' : 'emb'})`,
      valor: qtyN * updated.precoCusto,
      data: new Date().toISOString(),
      categoria: 'mercadoria'
    });

    setModalOpen(false);
    alert('Reposição registrada!');
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full animate-fade pb-24">
       <div className="flex items-center gap-3 text-text-dark font-bold text-xl mb-6">
          <div className="w-10 h-10 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shadow-sm">
            <Warehouse size={20} />
          </div>
          Controle de Estoque
       </div>

       <div className="flex flex-col gap-3">
         {prods.length === 0 ? (
           <div className="text-center p-12 bg-white border border-border rounded-2xl text-text-muted">
             <Warehouse size={48} className="mx-auto mb-4 opacity-20" />
             <p>Nenhum produto em estoque.</p>
           </div>
         ) : (
           prods.map(p => {
             const critico = p.vendePeso ? p.estoquePeso <= 0 : p.estoqueCaixas <= 0;
             const baixo = p.vendePeso ? p.estoquePeso <= p.estoqueMinimo : p.estoqueCaixas <= p.estoqueMinimo;

             return (
               <div key={p.id} className="bg-white p-4 rounded-xl border border-border flex items-center gap-4 hover:shadow-sm hover:border-text-medium transition-all group">
                 <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted transition-all flex-shrink-0">
                    <Box size={20} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="font-bold text-text-dark text-base">{p.nome}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className={cn(
                          "px-2.5 py-0.5 rounded-md text-[0.65rem] font-bold tracking-wide uppercase",
                          critico ? "bg-danger-light text-danger" : baixo ? "bg-warning-light text-warning" : "bg-primary-light text-primary-dark"
                       )}>
                         {critico ? "ZERADO" : baixo ? "BAIXO" : "OK"}
                       </span>
                       <span className="text-xs font-semibold text-text-medium">
                         {p.vendePeso 
                           ? `${formatWeight(p.estoquePeso)} disponíveis` 
                           : `${formatNumber(p.estoqueCaixas)} emb | ${formatNumber(p.estoqueCaixas * (p.unidadesPorCaixa||1) + (p.estoqueUnidades||0))} un total`
                         }
                       </span>
                    </div>
                 </div>
                 <div className="text-right flex flex-col items-end gap-2">
                    <div className="font-bold text-text-dark text-lg">{formatMoney(p.precoVenda)}</div>
                    <button onClick={() => openRepor(p)} className="bg-white border border-border text-text-dark font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 hover:bg-surface-2 transition-colors text-sm shadow-sm">
                       <Plus size={16} /> Repor
                    </button>
                 </div>
               </div>
             )
           })
         )}
       </div>

       {modalOpen && selectedP && (
         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-fade overflow-y-auto">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-slide-up">
               <h3 className="font-bold text-xl mb-6">Entrada de Mercadoria</h3>
               
               <form onSubmit={salvarRepor} className="space-y-4">
                  <div className="space-y-1 text-center bg-surface-2 rounded-xl p-3 border border-border mb-4">
                    <div className="text-xs text-text-medium font-semibold uppercase">Produto</div>
                    <div className="font-bold text-text-dark">{selectedP.nome}</div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-medium block">Quantidade ({selectedP.vendePeso ? 'Kilos' : 'Embalagens'})</label>
                    <input autoFocus required type="number" step={selectedP.vendePeso ? "0.001" : "1"} value={qtd} onChange={e => setQtd(e.target.value)} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none font-medium" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-text-medium block">Preço Custo ({selectedP.vendePeso ? 'por kg' : 'por emb'})</label>
                    <input required type="number" step="0.01" value={custo} onChange={e => setCusto(e.target.value)} className="w-full bg-white border border-border p-3 rounded-xl focus:border-primary focus:outline-none font-medium" />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3.5 rounded-xl bg-white border border-border font-bold text-text-dark hover:bg-surface-2 transition-colors">Cancelar</button>
                    <button type="submit" className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors">Confirmar</button>
                  </div>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}
