import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { Notification } from './components/Notification';
import { Dashboard } from './views/Dashboard';
import { Caixa } from './views/Caixa';
import { Produtos } from './views/Produtos';
import { Estoque } from './views/Estoque';
import { Fiados } from './views/Fiados';
import { Extrato } from './views/Extrato';
import { Relatorios } from './views/Relatorios';
import { SettingsView } from './views/Settings';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function App() {
  const { nav, isLoading, loadData, dbError } = useStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-primary">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  const renderView = () => {
    switch (nav) {
      case 'inicio': return <Dashboard />;
      case 'caixa': return <Caixa search={search} />;
      case 'produtos': return <Produtos search={search} />;
      case 'estoque': return <Estoque search={search} />;
      case 'fiados': return <Fiados search={search} />;
      case 'extrato': return <Extrato search={search} />;
      case 'relatorios': return <Relatorios />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-bg font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header search={search} setSearch={setSearch} />
        <div className="flex-1 overflow-y-auto scroll-smooth relative pb-28 md:pb-0">
          <Notification />
          
          {dbError && (
            <div className="m-4 md:m-6 bg-warning-light text-warning-dark p-6 rounded-xl shadow-md border border-warning-dark/20 animate-slide-up sticky top-4 z-50">
               <div className="flex items-start gap-4">
                 <AlertTriangle className="flex-shrink-0 mt-1 text-warning-dark" size={28} />
                 <div>
                   <h3 className="font-bold text-lg mb-1">Erro de Permissão no Banco de Dados</h3>
                   <p className="text-sm font-medium mb-3">{dbError}</p>
                   
                   <div className="bg-white/50 p-4 rounded-lg text-sm border border-warning-dark/10">
                     <p className="font-bold mb-2">Como resolver no Firebase:</p>
                     <ol className="list-decimal pl-5 space-y-1">
                       <li>Certeza que foi no <strong>Realtime Database</strong>? (Não no Firestore!)</li>
                       <li>Vá na aba <strong>Regras</strong> (Rules).</li>
                       <li>Apague tudo e cole exatamente isso:
<pre className="bg-white p-2 mt-2 rounded text-xs overflow-x-auto border border-warning-dark/20">
{`{
  "rules": {
    ".read": true,
    ".write": true
  }
}`}
</pre>
                       </li>
                       <li className="mt-2">Clique em <strong>Publicar</strong> e recarregue essa página.</li>
                     </ol>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {renderView()}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
