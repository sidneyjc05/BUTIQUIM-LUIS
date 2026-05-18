import React from 'react';
import { useStore } from '../store/useStore';
import { ChartLine, Box, MonitorSmartphone, HandCoins, Menu } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const { nav, setNav, setMobileMenuOpen, mobileMenuOpen } = useStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl flex justify-around items-center pt-2 pb-5 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl z-50">
      <NavItem icon={ChartLine} label="Início" isActive={nav === 'inicio'} onClick={() => setNav('inicio')} />
      <NavItem icon={Box} label="Produtos" isActive={nav === 'produtos'} onClick={() => setNav('produtos')} />
      
      <div className="relative w-16 h-12 flex justify-center">
        <button 
          onClick={() => setNav('caixa')}
          className="absolute -top-10 w-[68px] h-[68px] bg-primary text-white rounded-full flex flex-col justify-center items-center shadow-[0_8px_20px_rgba(0,168,89,0.3)] border-4 border-[#F0F4F2] transition-all hover:scale-110 active:scale-95 group"
        >
          <MonitorSmartphone size={24} className="mb-0.5 group-hover:-rotate-[-10deg] transition-transform" />
          <span className="text-[0.6rem] font-extrabold tracking-wide uppercase">Caixa</span>
        </button>
      </div>

      <NavItem icon={HandCoins} label="Fiados" isActive={nav === 'fiados'} onClick={() => setNav('fiados')} />
      <NavItem icon={Menu} label="Menu" isActive={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
    </nav>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick }: { icon: any, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 w-16 p-1.5 rounded-2xl transition-all relative active:scale-90",
        isActive ? "text-primary" : "text-text-muted hover:text-primary hover:-translate-y-1"
      )}
    >
      <Icon size={isActive ? 22 : 20} className={cn("transition-all", isActive && "animate-pop-in")} />
      <span className="text-[0.65rem] font-bold">{label}</span>
      {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full animate-pop-in" />}
    </button>
  );
}
