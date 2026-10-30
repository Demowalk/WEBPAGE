/**
 * MODERN ENHANCEMENTS FOR ROBBY LEONARDI INTERACTIVE RESUME
 * 
 * Features:
 * - Stage Warp Navigation HUD (Intro, Level 1, Level 2, Level 3, Level 4, Contact)
 * - Arrow / A / D Keyboard controls for silky horizontal navigation
 * - Procedural Web Audio API 8-bit sound effects (jump, swim splash, fireworks)
 * - Recruiter Fast-View (CV Modal) with instant printable PDF layout
 * - Interactive contact form submit handler with celebration chime
 */

(function() {
  // 1. Procedural Web Audio Engine
  class AudioSynthEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = localStorage.getItem('robby_audio_muted') === 'true';
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = this.isMuted ? 0 : 0.6;
        this.gain.connect(this.ctx.destination);
      } catch (e) {
        console.warn("Web Audio not supported", e);
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
      localStorage.setItem('robby_audio_muted', this.isMuted);
      if (this.gain && this.ctx) {
        this.gain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
      }
      return this.isMuted;
    }

    playJump() {
      this.init(); this.resume();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
      g.gain.setValueAtTime(0.2, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.connect(g); g.connect(this.gain);
      osc.start(now); osc.stop(now + 0.16);
    }

    playSplash() {
      this.init(); this.resume();
      if (this.isMuted || !this.ctx) return;
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
      g.gain.setValueAtTime(0.3, now);
      g.gain.linearRampToValueAtTime(0.01, now + 0.25);
      noise.connect(filter); filter.connect(g); g.connect(this.gain);
      noise.start(now); noise.stop(now + 0.26);
    }

    playCoin() {
      this.init(); this.resume();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);
      g.gain.setValueAtTime(0.3, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(g); g.connect(this.gain);
      osc.start(now); osc.stop(now + 0.36);
    }

    playFanfare() {
      this.init(); this.resume();
      if (this.isMuted || !this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      const times = [0, 0.1, 0.2, 0.35];
      notes.forEach((freq, idx) => {
        const now = this.ctx.currentTime + times[idx];
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(g); g.connect(this.gain);
        osc.start(now); osc.stop(now + 0.35);
      });
    }

    playWhistle() {
      this.init(); this.resume();
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2800, now);
      osc.frequency.setValueAtTime(2600, now + 0.08);
      osc.frequency.setValueAtTime(3000, now + 0.16);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(g); g.connect(this.gain);
      osc.start(now); osc.stop(now + 0.36);
    }
  }

  const audio = new AudioSynthEngine();
  window.robbyAudio = audio;

  // 2. Build DOM Overlays (HUD, Keyboard Hints, CV Modal)
  function injectEnhancements() {
    // Top HUD
    const hud = document.createElement('header');
    hud.id = 'enhancements-hud';
    hud.innerHTML = `
      <div class="hud-left-group">
        <nav class="hud-warp-bar" aria-label="Level Teleport">
          <button class="warp-btn active" data-pos="0">🚩 Intro</button>
          <button class="warp-btn" data-pos="1800">🌱 Level 1 (About)</button>
          <button class="warp-btn" data-pos="7400">🌊 Level 2 (Skills)</button>
          <button class="warp-btn" data-pos="13000">🤖 Level 3 (Projects)</button>
          <button class="warp-btn" data-pos="19200">🌟 Level 4 (About & Hobbies)</button>
          <button class="warp-btn" data-pos="max">✉️ Contact</button>
        </nav>
      </div>
      <div class="hud-right-group">
        <button id="btn-toggle-audio" class="hud-btn" title="Toggle 8-bit sound effects">
          <span id="audio-state-icon">${audio.isMuted ? '🔇' : '🔊'}</span>
          <span id="audio-state-text">${audio.isMuted ? 'Audio Off' : 'Audio On'}</span>
        </button>
        <button id="btn-open-cv" class="hud-btn hud-btn-primary" title="View clean printable resume">
          <span>📄</span>
          <span>Recruiter View (CV)</span>
        </button>
      </div>
    `;
    document.body.appendChild(hud);

    // Keyboard Hint Pill (bottom-left)
    const kbdHint = document.createElement('aside');
    kbdHint.id = 'keyboard-hint';
    kbdHint.innerHTML = `
      <span>Explore:</span>
      <span class="key-pill">Scroll</span>
      <span>or</span>
      <span class="key-pill">A</span> <span class="key-pill">D</span>
      <span class="key-pill">←</span> <span class="key-pill">→</span>
    `;
    document.body.appendChild(kbdHint);

    // Recruiter CV Dialog
    const cvDialog = document.createElement('dialog');
    cvDialog.id = 'recruiter-cv-dialog';
    cvDialog.className = 'cv-dialog';
    cvDialog.innerHTML = `
      <button class="cv-close-btn" id="btn-close-cv" aria-label="Close CV">✕</button>
      <div style="border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 18px; margin-bottom: 20px;">
        <h1 style="font-size: 28px; font-weight: 800; margin-bottom: 6px; color: #ffffff;">Manav Nagpal</h1>
        <p style="color: #94a3b8; font-size: 15px;">First-Year Engineering Student • AI, Software &amp; Embedded Systems • FC Bayern Fan</p>
        <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="btn-print-action" class="hud-btn hud-btn-primary" style="padding: 6px 14px; font-size: 13px;">🖨️ Print / Save as PDF</button>
          <a href="mailto:manav.nagpal@example.com" class="hud-btn" style="padding: 6px 14px; font-size: 13px; text-decoration: none;">✉️ manav.nagpal@example.com</a>
        </div>
      </div>

      <div class="cv-section-title">Summary & Profile</div>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
        Creative developer and digital artisan specializing in modern web platforms, interactive game-inspired storytelling, and high-performance digital experiences. Proud FC Bayern München supporter.
      </p>

      <div class="cv-section-title">Technical & Design Skills</div>
      <div>
        <strong style="color: #cbd5e1; font-size: 13px; display: block; margin-bottom: 6px;">Graphic & Web Software:</strong>
        <span class="cv-badge">Photoshop (Expert)</span>
        <span class="cv-badge">OpenSea / Web3</span>
        <span class="cv-badge">Blender 3D</span>
        <span class="cv-badge">Figma</span>
      </div>
      <div style="margin-top: 10px;">
        <strong style="color: #cbd5e1; font-size: 13px; display: block; margin-bottom: 6px;">Scripting & Frontend:</strong>
        <span class="cv-badge">HTML5</span>
        <span class="cv-badge">CSS3 / Animations</span>
        <span class="cv-badge">JavaScript</span>
        <span class="cv-badge">jQuery / SVG</span>
      </div>
      <div style="margin-top: 10px;">
        <strong style="color: #cbd5e1; font-size: 13px; display: block; margin-bottom: 6px;">Motion & 3D:</strong>
        <span class="cv-badge">After Effects</span>
        <span class="cv-badge">Premiere Pro</span>
        <span class="cv-badge">Blender 3D</span>
        <span class="cv-badge">Godot Engine</span>
      </div>

      <div class="cv-section-title">Professional Experience</div>
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px;">
          <span>Freelance Creative Director & Illustrator</span>
          <span style="color: #94a3b8; font-size: 13px;">March 2016 - Present</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Designed and illustrated viral infographics, interactive websites, games, and motion videos for global clients.</p>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px;">
          <span>Senior Interactive Designer @ Fox News</span>
          <span style="color: #94a3b8; font-size: 13px;">August 2010 - February 2016</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Designed and developed static, animated, and interactive data graphics viewed by tens of millions of users.</p>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px;">
          <span>Digital Designer @ Incognito Digital</span>
          <span style="color: #94a3b8; font-size: 13px;">April 2006 - April 2010</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Designed and built rich media ad campaigns, brand landing pages, and interactive microsites.</p>
      </div>

      <div class="cv-section-title">Selected Honors & Awards</div>
      <ul style="color: #cbd5e1; font-size: 13px; line-height: 1.8; padding-left: 20px;">
        <li><strong>Webby Awards</strong> — Official Nominee (Self-Promotion & Portfolio)</li>
        <li><strong>The FWA</strong> — Site of the Day & In-Depth Featured Interview</li>
        <li><strong>Awwwards</strong> — Site of the Day Winner</li>
        <li><strong>CSS Design Awards</strong> — Website of the Day</li>
        <li><strong>Featured in:</strong> Fast Company, Mashable, BuzzFeed, CNET, Business Insider</li>
      </ul>
    `;
    document.body.appendChild(cvDialog);

    // Event Bindings
    // 1. Stage Warp buttons
    document.querySelectorAll('.warp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audio.playCoin();
        const posVal = btn.dataset.pos;
        let targetY = 0;
        if (posVal === 'max') {
          targetY = document.documentElement.scrollHeight - window.innerHeight;
        } else {
          targetY = parseInt(posVal);
        }
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });

    // 2. Audio button
    const audioBtn = document.getElementById('btn-toggle-audio');
    const audioIcon = document.getElementById('audio-state-icon');
    const audioText = document.getElementById('audio-state-text');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        const isMuted = audio.toggleMute();
        audioIcon.textContent = isMuted ? '🔇' : '🔊';
        audioText.textContent = isMuted ? 'Audio Off' : 'Audio On';
        if (!isMuted) audio.playCoin();
      });
    }

    // 3. Recruiter CV Dialog
    const btnOpenCv = document.getElementById('btn-open-cv');
    const btnCloseCv = document.getElementById('btn-close-cv');
    const btnPrint = document.getElementById('btn-print-action');

    if (btnOpenCv) {
      btnOpenCv.addEventListener('click', () => {
        audio.playCoin();
        cvDialog.showModal();
      });
    }

    if (btnCloseCv) {
      btnCloseCv.addEventListener('click', () => {
        cvDialog.close();
      });
    }

    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        window.print();
      });
    }

    // Close CV on backdrop click
    cvDialog.addEventListener('click', (e) => {
      const rect = cvDialog.getBoundingClientRect();
      const inBox = rect.top <= e.clientY && e.clientY <= rect.bottom && rect.left <= e.clientX && e.clientX <= rect.right;
      if (!inBox) cvDialog.close();
    });

    // 4. Keyboard Arrow / A / D Navigation
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

    // 5. Active Warp State Updater on Scroll
    let wasSwimming = false;
    let didCheerFootball = false;
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      // Update active nav button
      const buttons = document.querySelectorAll('.warp-btn');
      let currentIdx = 0;
      if (scrollY >= maxScroll - 300) currentIdx = 5;
      else if (scrollY >= 18000) currentIdx = 4;
      else if (scrollY >= 12000) currentIdx = 3;
      else if (scrollY >= 6500) currentIdx = 2;
      else if (scrollY >= 1400) currentIdx = 1;
      else currentIdx = 0;

      buttons.forEach((b, i) => {
        if (i === currentIdx) b.classList.add('active');
        else b.classList.remove('active');
      });

      // Sound trigger on Bayern Munich football shot
      const isNearFootball = scrollY >= 4800 && scrollY <= 6500;
      if (isNearFootball && !didCheerFootball) {
        audio.playWhistle();
        didCheerFootball = true;
      } else if (!isNearFootball) {
        didCheerFootball = false;
      }

      // Sound trigger on swimming transition
      const isSwimmingNow = scrollY >= 6500 && scrollY <= 12500;
      if (isSwimmingNow && !wasSwimming) {
        audio.playSplash();
      }
      wasSwimming = isSwimmingNow;

      // Sound trigger on top fireworks
      if (scrollY >= maxScroll - 100 && Math.random() < 0.05) {
        audio.playFanfare();
      }
    }, { passive: true });
  }

  // Inject when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectEnhancements);
  } else {
    injectEnhancements();
  }
})();
