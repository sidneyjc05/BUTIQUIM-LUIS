import { create } from 'zustand';
import { Produto, Transacao, Fiado, Settings } from '../types';
import { db, ref, onValue, set, rootRef, remove } from '../lib/firebase';

interface AppState {
  produtos: Produto[];
  transacoes: Transacao[];
  fiados: Fiado[];
  settings: Settings;
  isLoading: boolean;
  dbError: string | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  nav: 'inicio' | 'caixa' | 'produtos' | 'estoque' | 'fiados' | 'extrato' | 'relatorios';
  setNav: (v: AppState['nav']) => void;
  loadData: () => void;
  saveData: () => Promise<void>;
  addTransacao: (t: Transacao) => Promise<void>;
  updateProduto: (p: Produto) => Promise<void>;
  removeProduto: (id: string) => Promise<void>;
  updateFiado: (f: Fiado) => Promise<void>;
  removeFiado: (id: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useStore = create<AppState>((setStore, get) => ({
  produtos: [],
  transacoes: [],
  fiados: [],
  settings: { saldoInicial: 0, lastWeeklyReset: null },
  isLoading: true,
  dbError: null,
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => setStore({ mobileMenuOpen }),
  nav: 'inicio',
  setNav: (nav) => setStore({ nav }),
  loadData: () => {
    onValue(rootRef, (snapshot) => {
      const val = snapshot.val() || {};
      setStore({
        produtos: Array.isArray(val.produtos) ? val.produtos : (val.produtos ? Object.values(val.produtos) : []),
        transacoes: Array.isArray(val.transacoes) ? val.transacoes : (val.transacoes ? Object.values(val.transacoes) : []),
        fiados: Array.isArray(val.fiados) ? val.fiados : (val.fiados ? Object.values(val.fiados) : []),
        settings: val.settings || { saldoInicial: 0, lastWeeklyReset: null },
        isLoading: false,
        dbError: null,
      });
      // Update fallback
      localStorage.setItem('botiquim_data_fallback', JSON.stringify(val));
    }, (error) => {
      console.error('Firebase Error:', error);
      try {
        const localData = localStorage.getItem('botiquim_data_fallback');
        if (localData) {
          const val = JSON.parse(localData);
          setStore({
            produtos: val.produtos || [],
            transacoes: val.transacoes || [],
            fiados: val.fiados || [],
            settings: val.settings || { saldoInicial: 0, lastWeeklyReset: null },
            isLoading: false,
            dbError: "Aviso: " + error.message + " (Usando dados modo Offline)",
          });
          return;
        }
      } catch(e) {}
      setStore({ isLoading: false, dbError: "Aviso: " + error.message + " (Usando dados modo Offline)" });
    });
  },
  saveData: async () => {
    const state = get();
    const dataToSave = {
      produtos: state.produtos,
      transacoes: state.transacoes,
      fiados: state.fiados,
      settings: state.settings,
    };
    
    // Always save local fallback
    localStorage.setItem('botiquim_data_fallback', JSON.stringify(dataToSave));
    
    // Try to save to firebase
    try {
      await set(rootRef, dataToSave);
    } catch (error) {
      console.error("Failed to save to firebase, saved locally", error);
    }
  },
  addTransacao: async (t) => {
    setStore((s) => ({ transacoes: [...s.transacoes, t] }));
    await get().saveData();
  },
  updateProduto: async (p) => {
    setStore((s) => {
      const idx = s.produtos.findIndex((x) => x.id === p.id);
      if (idx >= 0) {
        const novos = [...s.produtos];
        novos[idx] = p;
        return { produtos: novos };
      }
      return { produtos: [...s.produtos, p] };
    });
    await get().saveData();
  },
  removeProduto: async (id) => {
    setStore((s) => ({ produtos: s.produtos.filter((p) => p.id !== id) }));
    await get().saveData();
  },
  updateFiado: async (f) => {
    setStore((s) => {
      const idx = s.fiados.findIndex((x) => x.id === f.id);
      if (idx >= 0) {
        const novos = [...s.fiados];
        novos[idx] = f;
        return { fiados: novos };
      }
      return { fiados: [...s.fiados, f] };
    });
    await get().saveData();
  },
  removeFiado: async (id) => {
    setStore((s) => ({ fiados: s.fiados.filter((f) => f.id !== id) }));
    await get().saveData();
  },
  resetAllData: async () => {
    await remove(rootRef);
    setStore({ produtos: [], transacoes: [], fiados: [], settings: { saldoInicial: 0, lastWeeklyReset: null } });
  }
}));
