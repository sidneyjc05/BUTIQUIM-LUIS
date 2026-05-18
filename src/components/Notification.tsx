import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, AlertTriangle, X, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { playChimeSound, playErrorSound } from '../lib/audio';

export function Notification() {
  const { notification, setNotification } = useStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (notification) {
      setShow(true);
      
      // Play a little chime on notification
      if (notification.type === 'success') {
        playChimeSound();
      } else {
        playErrorSound();
      }

      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => setNotification(null), 300); // Wait for transition
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification) return null;

  return (
    <div 
      className={cn(
        "fixed top-4 right-4 md:right-6 left-4 md:left-auto md:w-96 p-4 rounded-2xl flex items-start gap-4 shadow-2xl z-[200] transition-all duration-300 transform",
        show ? "translate-y-0 opacity-100 scale-100" : "-translate-y-10 opacity-0 scale-95",
        notification.type === 'success' ? "bg-white border-l-4 border-l-primary" : "bg-white border-l-4 border-l-red-500",
        "border border-border/50 backdrop-blur-xl"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
        notification.type === 'success' ? "bg-primary/10 text-primary" : "bg-red-50 text-red-500"
      )}>
        {notification.type === 'success' ? <Bell size={20} className="animate-pop-in" /> : <AlertTriangle size={20} className="animate-pulse-soft" />}
      </div>
      <div className="flex-1 mt-1">
        <h4 className="text-sm font-bold text-text-dark mb-0.5">
          {notification.type === 'success' ? 'Sucesso' : 'Aviso'}
        </h4>
        <p className="font-medium text-sm text-text-medium leading-tight">{notification.text}</p>
      </div>
      <button 
        onClick={() => setShow(false)} 
        className="shrink-0 hover:bg-black/5 p-1.5 rounded-full text-text-muted transition-colors mt-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
}
