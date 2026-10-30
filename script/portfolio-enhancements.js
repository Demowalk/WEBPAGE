/**
 * MODERN ENHANCEMENTS FOR MANAV NAGPAL INTERACTIVE RESUME
 * 
 * - Procedural Web Audio API 8-bit sound effects (ALWAYS ON, unlocks on first interaction)
 * - Arrow / A / D Keyboard controls for smooth horizontal navigation
 * - No UI overlays / No HUD / No CV modal (Full-screen clean game experience)
 */

(function() {
  // 1. Procedural Web Audio Engine (Always On)
  class AudioSynthEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false; // Audio is ALWAYS ON
      this.hasUnlocked = false;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.55;
        this.gain.connect(this.ctx.destination);
      } catch (e) {
        console.warn("Web Audio not supported", e);
      }
    }

    unlock() {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.hasUnlocked = true;
    }

    playJump() {
      if (!this.hasUnlocked) this.unlock();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
      g.gain.setValueAtTime(0.18, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.connect(g); g.connect(this.gain);
      osc.start(now); osc.stop(now + 0.16);
    }

    playSplash() {
      if (!this.hasUnlocked) this.unlock();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const bufSize = this.ctx.sampleRate * 0.25;
      const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buf;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(150, now + 0.25);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.28, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.25);
      noise.connect(filter); filter.connect(g); g.connect(this.gain);
      noise.start(now); noise.stop(now + 0.26);
    }

    playFanfare() {
      if (!this.hasUnlocked) this.unlock();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const times = [0, 0.1, 0.2, 0.35];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + times[idx];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.22, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g); g.connect(this.gain);
        osc.start(now); osc.stop(now + 0.35);
      });
    }

    playWhistle() {
      if (!this.hasUnlocked) this.unlock();
      if (!this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.setValueAtTime(2600, now + 0.08);
      osc.frequency.setValueAtTime(3000, now + 0.16);
      g.gain.setValueAtTime(0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(g); g.connect(this.gain);
      osc.start(now); osc.stop(now + 0.36);
    }
  }

  const audio = new AudioSynthEngine();
  window.robbyAudio = audio;

  // Unlock audio on the very first user interaction
  const unlockEvents = ['click', 'touchstart', 'keydown', 'wheel', 'scroll'];
  const onFirstInteraction = () => {
    audio.unlock();
    unlockEvents.forEach(evt => window.removeEventListener(evt, onFirstInteraction, { passive: true }));
  };
  unlockEvents.forEach(evt => window.addEventListener(evt, onFirstInteraction, { passive: true }));

  // 2. Smooth Arrow / A / D Keyboard Navigation
  let activeKeys = {};
  let keyScrollInterval = null;

  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) {
      activeKeys[e.code] = true;
      if (!keyScrollInterval) {
        keyScrollInterval = setInterval(() => {
          const step = 45;
          if (activeKeys['ArrowLeft'] || activeKeys['KeyA']) {
            window.scrollBy({ top: -step, behavior: 'auto' });
          }
          if (activeKeys['ArrowRight'] || activeKeys['KeyD']) {
            window.scrollBy({ top: step, behavior: 'auto' });
          }
        }, 20);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    delete activeKeys[e.code];
    if (!activeKeys['ArrowLeft'] && !activeKeys['KeyA'] && !activeKeys['ArrowRight'] && !activeKeys['KeyD']) {
      clearInterval(keyScrollInterval);
      keyScrollInterval = null;
    }
  });

  // 3. Audio Triggers on Gameplay Milestones
  let wasSwimming = false;
  let didCheerFootball = false;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    // Referee whistle at FC Bayern München football section
    const isNearFootball = scrollY >= 4800 && scrollY <= 6500;
    if (isNearFootball && !didCheerFootball) {
      audio.playWhistle();
      didCheerFootball = true;
    } else if (!isNearFootball) {
      didCheerFootball = false;
    }

    // Splash sound entering the ocean (Level 2 Skills)
    const isSwimmingNow = scrollY >= 6500 && scrollY <= 12500;
    if (isSwimmingNow && !wasSwimming) {
      audio.playSplash();
    }
    wasSwimming = isSwimmingNow;

    // Victory fanfare at the fireworks contact cloud
    if (scrollY >= maxScroll - 100 && Math.random() < 0.05) {
      audio.playFanfare();
    }
  }, { passive: true });
})();
