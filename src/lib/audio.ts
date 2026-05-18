let audioCtx: AudioContext | null = null;
let isUnlocked = false;

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
        audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function unlockAudio() {
  if (isUnlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      isUnlocked = true;
    }).catch(console.error);
  } else {
    isUnlocked = true;
  }
  
  // Play silent buffer to unlock the audio context on iOS/mobile
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    console.error("Silent buffer error", e);
  }
}

export function playPopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => playOscillator(ctx, 600, 900, 0.4, 0.1, 'sine')).catch(console.error);
    return;
  }
  playOscillator(ctx, 600, 900, 0.4, 0.1, 'sine');
}

export function playSoftPopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => playOscillator(ctx, 400, 600, 0.2, 0.1, 'sine')).catch(console.error);
    return;
  }
  playOscillator(ctx, 400, 600, 0.2, 0.1, 'sine');
}

export function playChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => playOscillator(ctx, 800, 1200, 0.2, 0.3, 'sine')).catch(console.error);
    return;
  }
  playOscillator(ctx, 800, 1200, 0.2, 0.3, 'sine');
}

export function playErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => playOscillator(ctx, 300, 200, 0.3, 0.3, 'triangle')).catch(console.error);
    return;
  }
  playOscillator(ctx, 300, 200, 0.3, 0.3, 'triangle');
}

function playOscillator(ctx: AudioContext, freqStart: number, freqEnd: number, gainStart: number, duration: number, type: OscillatorType) {
  try {
    const os = ctx.createOscillator();
    const gain = ctx.createGain();
    
    os.type = type;
    const t = ctx.currentTime + 0.01;
    
    // Fallback if exponentialRamp fails
    try {
      os.frequency.setValueAtTime(freqStart, t);
      os.frequency.exponentialRampToValueAtTime(freqEnd, t + duration);
      
      gain.gain.setValueAtTime(gainStart, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    } catch(err) {
      // Linear fallback
      os.frequency.setValueAtTime(freqStart, t);
      os.frequency.linearRampToValueAtTime(freqEnd, t + duration);
      gain.gain.setValueAtTime(gainStart, t);
      gain.gain.linearRampToValueAtTime(0.001, t + duration);
    }
    
    os.connect(gain);
    gain.connect(ctx.destination);
    
    os.start(t);
    os.stop(t + duration + 0.05); // slightly longer stop to prevent clipping
  } catch (e) {
    console.error("Audio playback error", e);
  }
}

