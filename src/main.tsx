import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { playPopSound, playSoftPopSound, unlockAudio } from './lib/audio';

document.addEventListener('pointerdown', () => {
    unlockAudio();
}, { once: true, capture: true });

document.addEventListener('click', (e) => {
  try {
    unlockAudio();
    
    let isButton = false;
    const target = e.target as Element;
    if (target && typeof target.closest === 'function') {
      isButton = !!target.closest('button, a, input, select, [role="button"], .nav-item');
    }

    if (isButton) {
      playPopSound();
    } else {
      playSoftPopSound();
    }
  } catch (err) {
    console.error('Audio click error:', err);
  }
}, { capture: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
