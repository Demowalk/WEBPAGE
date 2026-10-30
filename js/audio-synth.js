/**
 * AUDIO SYNTHESIZER (Web Audio API)
 * 
 * 100% procedural 8-bit retro sound generator.
 * Zero external MP3/audio files needed; plays instantly with zero loading delay!
 */

class RetroAudioSynth {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('pixel_portfolio_muted') === 'true';
    this.bgmPlaying = false;
    this.bgmOscs = [];
    this.bgmInterval = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
  }

  // Lazy-initialize AudioContext on first user interaction (browser policy compliance)
  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.6;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.22;
      this.bgmGain.connect(this.masterGain);
    } catch (e) {
      console.warn("Web Audio API not supported in this browser:", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.isMuted = !this.isMuted;
    localStorage.setItem('pixel_portfolio_muted', this.isMuted);
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, now, 0.05);
    }
    return this.isMuted;
  }

  // SFX: Mario-style Jump
  playJump() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.16);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.19);
  }

  // SFX: Super Mario Coin Collect
  playCoin() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'sine';
    // B5 (987.77 Hz) to E6 (1318.51 Hz)
    osc1.frequency.setValueAtTime(987.77, now);
    osc1.frequency.setValueAtTime(1318.51, now + 0.08);

    gain1.gain.setValueAtTime(0.35, now);
    gain1.gain.setValueAtTime(0.35, now + 0.08);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);

    osc1.start(now);
    osc1.stop(now + 0.43);
  }

  // SFX: Question Block Hit / Bump
  playBlockBump() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.13);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // SFX: Submarine Sonar Ping
  playSonar() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(1550, now + 0.6);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.82);
  }

  // SFX: Water Splash
  playSplash() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    // Generate white noise buffer for splash
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.26);
  }

  // SFX: Hot Air Balloon Burner Puff
  playPuff() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.19);
  }

  // SFX: Stage Clear / Victory Fanfare
  playFanfare() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const noteTimes = [0, 0.12, 0.24, 0.38];
    const noteDurs = [0.1, 0.1, 0.1, 0.4];

    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + noteTimes[idx];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteDurs[idx]);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + noteDurs[idx] + 0.05);
    });
  }

  // SFX: UI Click
  playClick() {
    this.init();
    this.resume();
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(1200, now + 0.02);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  // Optional Retro Chiptune Background Music Loop
  startBgm() {
    this.init();
    this.resume();
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;

    // Upbeat 8-bit melody sequence (frequencies in Hz)
    // C major pentatonic cheerful arpeggios
    const melody = [
      261.63, 329.63, 392.00, 523.25,
      392.00, 329.63, 440.00, 392.00,
      349.23, 392.00, 440.00, 523.25,
      392.00, 329.63, 293.66, 261.63
    ];

    const bass = [
      130.81, 130.81, 196.00, 196.00,
      174.61, 174.61, 196.00, 196.00
    ];

    let step = 0;
    const stepDuration = 200; // ms per 16th note

    this.bgmInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Lead voice
      const oscLead = this.ctx.createOscillator();
      const gainLead = this.ctx.createGain();
      oscLead.type = 'pulse' in oscLead ? 'pulse' : 'square';
      oscLead.frequency.setValueAtTime(melody[step % melody.length], now);

      gainLead.gain.setValueAtTime(0.08, now);
      gainLead.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      oscLead.connect(gainLead);
      gainLead.connect(this.bgmGain);
      oscLead.start(now);
      oscLead.stop(now + 0.17);

      // Bass voice (every 2 steps)
      if (step % 2 === 0) {
        const oscBass = this.ctx.createOscillator();
        const gainBass = this.ctx.createGain();
        oscBass.type = 'triangle';
        const bassIdx = Math.floor((step / 2) % bass.length);
        oscBass.frequency.setValueAtTime(bass[bassIdx], now);

        gainBass.gain.setValueAtTime(0.12, now);
        gainBass.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

        oscBass.connect(gainBass);
        gainBass.connect(this.bgmGain);
        oscBass.start(now);
        oscBass.stop(now + 0.34);
      }

      step++;
    }, stepDuration);
  }

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmPlaying = false;
  }
}

// Global Audio Singleton
window.audioSynth = new RetroAudioSynth();
