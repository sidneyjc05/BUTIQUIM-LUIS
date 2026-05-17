import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Save, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings, resetAllData } = useStore();
  const [saldo, setSaldo] = useState(settings.saldoInicial.toString());
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = () => {
    const num = parseFloat(saldo);
    if (!isNaN(num)) {
      updateSettings({ saldoInicial: num });
      setMessage({ text: 'Configurações salvas com sucesso!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ text: 'Por favor, insira um valor válido para o saldo.', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReset = async () => {
    await resetAllData();
    setShowConfirmReset(false);
    setMessage({ text: 'Todos os dados foram apagados do banco de dados.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Configurações</h2>
      
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-8">
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Caixa</h3>
          <div className="grid gap-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-text-medium mb-1">
                Saldo Inicial (R$)
              </label>
              <input
                type="number"
                value={saldo}
                onChange={(e) => setSaldo(e.target.value)}
                step="0.01"
                className="w-full h-11 px-4 rounded-xl border border-border focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
                placeholder="0.00"
              />
            </div>
            <button
              onClick={handleSave}
              className="h-11 bg-brand-primary hover:bg-brand-primary/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h3 className="text-lg font-semibold text-danger mb-2 flex items-center gap-2">
            <AlertTriangle size={20} />
            Zona de Perigo
          </h3>
          <p className="text-sm text-text-medium mb-4">
            Atenção: Ao zerar os dados, todas as transações, produtos e fiados serão removidos permanentemente.
          </p>
          
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="h-11 px-6 bg-red-50 text-danger hover:bg-red-100 hover:text-red-700 font-medium rounded-xl transition-colors flex items-center gap-2 border border-red-100"
            >
              <AlertTriangle size={18} />
              Zerar Todos os Dados
            </button>
          ) : (
            <div className="p-5 border border-red-200 bg-red-50 rounded-xl space-y-4">
              <p className="font-medium text-red-800">
                Tem certeza que deseja apagar TODOS os dados do sistema? Esta ação irá apagar todo o banco de dados e NÃO pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 h-11 bg-danger hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
                >
                  Sim, apagar tudo
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 h-11 bg-white text-text-medium border border-border hover:bg-gray-50 font-medium rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
