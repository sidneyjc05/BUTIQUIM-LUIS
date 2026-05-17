import React from 'react';
import { useStore } from '../store/useStore';
import { Store, ChartLine, MonitorSmartphone, Box, Warehouse, HandCoins, Receipt, ChartPie } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar() {
  const { nav, setNav, mobileMenuOpen, setMobileMenuOpen } = useStore();
  
  const navItems = [
    { id: 'inicio', label: 'Dashboard', icon: ChartLine },
    { id: 'caixa', label: 'Caixa', icon: MonitorSmartphone },
    { id: 'produtos', label: 'Produtos', icon: Box },
    { id: 'estoque', label: 'Estoque', icon: Warehouse },
    { id: 'fiados', label: 'Fiados', icon: HandCoins },
    { id: 'extrato', label: 'Extrato', icon: Receipt },
    { id: 'relatorios', label: 'Relatórios', icon: ChartPie },
  ] as const;

  const handleNavClick = (id: any) => {
    setNav(id);
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay Background */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <nav className={cn(
        "fixed md:static inset-y-0 right-0 md:inset-auto bg-white border-l md:border-l-0 md:border-r border-border shrink-0 md:flex flex-col z-[70] w-[260px] transform transition-transform duration-300 md:transform-none shadow-2xl md:shadow-none",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        <div className="p-8 pb-6 flex flex-col gap-1 items-start md:items-stretch">
          <div className="font-bold flex items-center gap-3 text-text-dark text-xl">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
              <Store size={22} />
            </div>
            Botiquim Fácil
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 flex flex-col px-4 gap-2">
          <button 
            onClick={() => handleNavClick('caixa')}
            className="mb-6 bg-primary text-white font-bold py-3.5 px-4 rounded-2xl flex justify-center items-center gap-2 shadow-lg shadow-primary-light hover:bg-primary-dark transition-colors w-full"
          >
            <MonitorSmartphone size={20} /> NOVO CAIXA
          </button>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                "w-full px-4 py-3.5 flex items-center gap-3 font-semibold text-sm transition-all rounded-2xl",
                nav === item.id 
                  ? "text-primary bg-primary-light" 
                  : "text-text-medium hover:bg-surface-2 hover:text-text-dark"
              )}
            >
              <item.icon size={20} className={cn("transition-transform", nav === item.id && "scale-110")} />
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="p-4 py-12 md:py-4 text-xs text-text-muted text-center border-t border-border font-medium">
          Botiquim Fácil Pro
        </div>
      </nav>
    </>
  );
}
