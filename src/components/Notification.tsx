import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export function Notification() {
  const { notification, setNotification } = useStore();

  if (!notification) return null;

  return (
    <div className={`fixed bottom-24 md:top-6 right-6 p-4 rounded-xl flex items-center gap-3 shadow-lg z-[100] animate-slide-up ${notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
      {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
      <p className="font-medium text-sm">{notification.text}</p>
      <button onClick={() => setNotification(null)} className="ml-2 hover:bg-black/5 p-1 rounded-full">
        <X size={16} />
      </button>
    </div>
  );
}
