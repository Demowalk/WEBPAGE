/**
 * GAME ENGINE (HTML5 Canvas 60/120 FPS High-DPI Engine)
 * 
 * Features:
 * - 5 Seamless Biomes (Meadows, Skill Grove, Ocean Trench, Stratosphere, Victory Citadel)
 * - Multi-layer Parallax Scrolling with depth & atmosphere
 * - Procedural crisp pixel character with 4 transformation states:
 *     1. Runner / Jumper
 *     2. Submarine Pilot
 *     3. Hot Air Balloon Aeronaut
 *     4. Citadel Champion
 * - Mario-style '?' Mystery Blocks that bounce and pop coins when hit from below
 * - Collectible Gold Coins & Star Gems with particle effects
 * - Dynamic Particle Systems (Dust, Bubbles, Sparks, Fireworks, Confetti)
 * - Dual Input: Driven smoothly by Scroll OR direct Arcade controls (WASD/Arrows/Space)
 */

class GameEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Virtual World Dimensions
    this.worldWidth = 14200;
    this.worldHeight = 1000;
    this.groundY = 720;
    
    // Viewport & Scaling
    this.cameraX = 0;
    this.cameraTargetX = 0;
    this.scale = 1;
    this.dpr = window.devicePixelRatio || 1;
    
    // Player State
    this.player = {
      x: 120,
      y: this.groundY - 64,
      width: 44,
      height: 64,
      vx: 0,
      vy: 0,
      speed: 8.5,
      jumpForce: -16.5,
      isGrounded: true,
      facing: 1, // 1: right, -1: left
      frame: 0,
      animTimer: 0,
      state: 'walk', // 'walk', 'sub', 'balloon', 'castle'
      coins: 0,
      score: 0
    };

    // Controller Inputs
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false,
      interact: false
    };

    // Game Entities
    this.coins = [];
    this.blocks = [];
    this.particles = [];
    this.kiosks = [];
    this.chests = [];
    this.milestones = [];
    this.fireworks = [];

    // Animation / Time
    this.lastTime = performance.now();
    this.scrollProgress = 0;
    this.isManualControlling = false;
    this.manualControlTimeout = null;

    // Windmill / Ambient animations
    this.windmillAngle = 0;
    this.propellerAngle = 0;
    this.waterWaveOffset = 0;
    this.fireflyTimer = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.buildWorldEntities();
    this.bindEvents();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    // Retina / High-DPI scaling
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    // Dynamic scale to fit target vertical space comfortably
    this.scale = Math.min(1.15, Math.max(0.68, this.height / 850));
  }

  // Populate interactive coins, question blocks, chests, and project kiosks
  buildWorldEntities() {
    this.coins = [];
    this.blocks = [];
    this.kiosks = [];
    this.chests = [];

    // --- STAGE 1: MEADOWS (x: 0 - 2600) ---
    // Coins scattered in fun arcs
    for (let x = 400; x < 2400; x += 180) {
      const arcY = this.groundY - 120 - Math.sin((x / 180) * Math.PI) * 50;
      this.coins.push({ x, y: arcY, collected: false, value: 100, rot: Math.random() * Math.PI });
    }

    // --- STAGE 2: SKILL GROVE (x: 2600 - 5600) ---
    // Mario-style question blocks and brick platforms
    const skillCategories = PORTFOLIO_DATA.skills || [];
    let catX = 3000;

    skillCategories.forEach((cat, catIdx) => {
      // Floating brick platform
      const platY = this.groundY - 150;
      
      // Question block that pops skill info
      this.blocks.push({
        x: catX + 160,
        y: platY - 90,
        w: 48,
        h: 48,
        type: 'question',
        hit: false,
        bounceY: 0,
        category: cat.category,
        color: cat.color,
        skills: cat.items
      });

      // Supporting bricks
      this.blocks.push({ x: catX + 112, y: platY - 90, w: 48, h: 48, type: 'brick', hit: false, bounceY: 0 });
      this.blocks.push({ x: catX + 208, y: platY - 90, w: 48, h: 48, type: 'brick', hit: false, bounceY: 0 });

      // Arc of coins above
      for (let i = 0; i < 3; i++) {
        this.coins.push({ x: catX + 112 + i * 48, y: platY - 170, collected: false, value: 150, rot: 0 });
      }

      catX += 850;
    });

    // --- STAGE 3: OCEAN TRENCH (x: 5600 - 8800) ---
    // Deep sea coins and sunken treasure chests for career milestones
    const experiences = PORTFOLIO_DATA.experience || [];
    let expX = 6200;

    experiences.forEach((exp, idx) => {
      const chestY = this.groundY + 10;
      this.chests.push({
        id: exp.id,
        x: expX,
        y: chestY,
        w: 64,
        h: 52,
        data: exp,
        opened: false,
        bobble: 0
      });

      // Underwater bubble coins leading to chest
      for (let c = 0; c < 4; c++) {
        this.coins.push({
          x: expX - 120 + c * 80,
          y: this.groundY - 80 - Math.sin(c) * 60,
          collected: false,
          value: 200,
          rot: 0
        });
      }

      expX += 800;
    });

    // --- STAGE 4: STRATOSPHERE (x: 8800 - 12000) ---
    // Floating arcade project kiosks
    const projects = PORTFOLIO_DATA.projects || [];
    let projX = 9200;

    projects.forEach((proj, idx) => {
      const islandY = this.groundY - 160 - (idx % 2 === 0 ? 40 : -30);
      this.kiosks.push({
        id: proj.id,
        x: projX,
        y: islandY,
        w: 96,
        h: 120,
        data: proj,
        hovered: false,
        pulse: 0
      });

      // Orbiting coins
      for (let c = 0; c < 3; c++) {
        this.coins.push({
          x: projX - 60 + c * 60,
          y: islandY - 70,
          collected: false,
          value: 250,
          rot: 0
        });
      }

      projX += 750;
    });

    // --- STAGE 5: CITADEL & CONTACT (x: 12000 - 14000) ---
    // Final high-value victory gems and flagpole
    for (let c = 0; c < 6; c++) {
      this.coins.push({
        x: 12500 + c * 140,
        y: this.groundY - 130 - (c * 20),
        collected: false,
        value: 500,
        isGem: true,
        rot: 0
      });
    }
  }

  bindEvents() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.setManualMode();
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
        case 'KeyW':
        case 'ArrowUp':
          this.keys.up = true;
          if (this.player.state !== 'sub' && this.player.state !== 'balloon') {
            this.tryJump();
          }
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = true;
          break;
        case 'Space':
          e.preventDefault();
          this.tryJump();
          break;
        case 'KeyE':
          this.checkInteractions();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
        case 'KeyW':
        case 'ArrowUp':
          this.keys.up = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.down = false;
          break;
        case 'Space':
          this.keys.jump = false;
          break;
      }
    });

    // Mobile Virtual Touch Buttons
    this.bindTouchControls();
  }

  bindTouchControls() {
    const btnLeft = document.getElementById('touch-left');
    const btnRight = document.getElementById('touch-right');
    const btnJump = document.getElementById('touch-jump');

    if (btnLeft && btnRight && btnJump) {
      const handleTouch = (btn, key, val) => {
        const start = (e) => { e.preventDefault(); this.setManualMode(); this.keys[key] = val; };
        const end = (e) => { e.preventDefault(); this.keys[key] = false; };
        btn.addEventListener('touchstart', start, { passive: false });
        btn.addEventListener('touchend', end, { passive: false });
        btn.addEventListener('mousedown', start);
        btn.addEventListener('mouseup', end);
      };

      handleTouch(btnLeft, 'left', true);
      handleTouch(btnRight, 'right', true);

      const jumpStart = (e) => {
        e.preventDefault();
        this.setManualMode();
        this.tryJump();
      };
      btnJump.addEventListener('touchstart', jumpStart, { passive: false });
      btnJump.addEventListener('mousedown', jumpStart);
    }
  }

  setManualMode() {
    this.isManualControlling = true;
    clearTimeout(this.manualControlTimeout);
    // After 4 seconds of no arcade input, smooth scroll synchronization resumes gracefully
    this.manualControlTimeout = setTimeout(() => {
      this.isManualControlling = false;
    }, 4000);
  }

  // Smooth scroll input updates target position
  updateFromScroll(scrollRatio) {
    if (this.isManualControlling) return;
    this.scrollProgress = Math.max(0, Math.min(1, scrollRatio));
    // Calculate world X from scroll
    const targetX = 120 + this.scrollProgress * (this.worldWidth - 1400);
    
    // Smoothly nudge player toward target
    const diff = targetX - this.player.x;
    if (Math.abs(diff) > 2) {
      this.player.facing = diff > 0 ? 1 : -1;
      this.player.x += diff * 0.12;
      this.player.animTimer += 0.2;
    }
  }

  tryJump() {
    if (this.player.state === 'walk' || this.player.state === 'castle') {
      if (this.player.isGrounded) {
        this.player.vy = this.player.jumpForce;
        this.player.isGrounded = false;
        if (window.audioSynth) window.audioSynth.playJump();
        this.createDustParticles(this.player.x + 22, this.player.y + 60, 6);
      }
    } else if (this.player.state === 'sub') {
      this.player.vy = -6;
      if (window.audioSynth) window.audioSynth.playSonar();
      this.createBubbleParticles(this.player.x, this.player.y + 20, 5);
    } else if (this.player.state === 'balloon') {
      this.player.vy = -5.5;
      if (window.audioSynth) window.audioSynth.playPuff();
      this.createPuffParticles(this.player.x + 22, this.player.y + 80, 4);
    }
  }

  // Main Loop
  gameLoop(currentTime) {
    const dt = Math.min(50, currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // Determine player state based on world position
    const px = this.player.x;
    const oldState = this.player.state;

    if (px < 5600) {
      this.player.state = 'walk';
    } else if (px >= 5600 && px < 8800) {
      this.player.state = 'sub';
    } else if (px >= 8800 && px < 12000) {
      this.player.state = 'balloon';
    } else {
      this.player.state = 'castle';
    }

    // Sound effect trigger on stage transition
    if (oldState !== this.player.state) {
      if (this.player.state === 'sub' && window.audioSynth) {
        window.audioSynth.playSplash();
        this.createSplashParticles(this.player.x, this.groundY - 100);
      } else if (this.player.state === 'balloon' && window.audioSynth) {
        window.audioSynth.playPuff();
      } else if (this.player.state === 'castle' && window.audioSynth) {
        window.audioSynth.playFanfare();
        this.spawnFireworks(this.player.x + 200, 300);
      }
    }

    // Manual Arcade physics
    if (this.isManualControlling) {
      if (this.keys.left) {
        this.player.vx = -this.player.speed;
        this.player.facing = -1;
        this.player.animTimer += 0.25;
      } else if (this.keys.right) {
        this.player.vx = this.player.speed;
        this.player.facing = 1;
        this.player.animTimer += 0.25;
      } else {
        this.player.vx *= 0.78;
      }

      // Vertical movement depending on vehicle
      if (this.player.state === 'sub') {
        if (this.keys.up) this.player.vy = -5;
        else if (this.keys.down) this.player.vy = 5;
        else this.player.vy *= 0.88;
      } else if (this.player.state === 'balloon') {
        if (this.keys.up) this.player.vy = -4.5;
        else if (this.keys.down) this.player.vy = 4.5;
        else this.player.vy *= 0.88;
      } else {
        // Standard gravity for walker
        this.player.vy += 0.85; // Gravity
      }

      this.player.x += this.player.vx;
      this.player.y += this.player.vy;
    } else {
      // Automatic gentle floating for sub/balloon when idle
      if (this.player.state === 'sub') {
        this.player.y = this.groundY - 140 + Math.sin(performance.now() * 0.003) * 20;
      } else if (this.player.state === 'balloon') {
        this.player.y = this.groundY - 260 + Math.sin(performance.now() * 0.002) * 25;
      } else {
        this.player.y = this.groundY - 64;
        this.player.isGrounded = true;
      }
    }

    // Bounds checking
    this.player.x = Math.max(60, Math.min(this.worldWidth - 100, this.player.x));

    // Ground collision for walker
    if (this.player.state === 'walk' || this.player.state === 'castle') {
      const targetGround = this.groundY - 64;
      if (this.player.y >= targetGround) {
        this.player.y = targetGround;
        this.player.vy = 0;
        this.player.isGrounded = true;
      }
    } else if (this.player.state === 'sub') {
      // Submarine ocean ceiling and floor
      const oceanTop = this.groundY - 280;
      const oceanFloor = this.groundY - 40;
      if (this.player.y < oceanTop) this.player.y = oceanTop;
      if (this.player.y > oceanFloor) this.player.y = oceanFloor;
    } else if (this.player.state === 'balloon') {
      // Sky limits
      const skyTop = 180;
      const skyBottom = this.groundY - 120;
      if (this.player.y < skyTop) this.player.y = skyTop;
      if (this.player.y > skyBottom) this.player.y = skyBottom;
    }

    // Camera follow (lerp)
    const targetCamX = this.player.x - (this.width / (2 * this.scale));
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    this.cameraX = Math.max(0, Math.min(this.worldWidth - (this.width / this.scale), this.cameraX));

    // Update Coin Collisions
    this.coins.forEach((coin) => {
      if (!coin.collected) {
        const dx = (this.player.x + 22) - coin.x;
        const dy = (this.player.y + 32) - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 40) {
          coin.collected = true;
          this.player.coins++;
          this.player.score += coin.value;
          if (window.audioSynth) window.audioSynth.playCoin();
          this.createSparkleParticles(coin.x, coin.y, 8);
          this.updateHUD();
        }
      }
    });

    // Update Mystery Block Collisions (Hit from bottom when jumping)
    this.blocks.forEach((block) => {
      if (block.type === 'question' && !block.hit) {
        const px = this.player.x + 22;
        const py = this.player.y;
        if (px >= block.x && px <= block.x + block.w && py <= block.y + block.h + 10 && py >= block.y && this.player.vy < 0) {
          block.hit = true;
          block.bounceY = -14;
          this.player.vy = 2; // Bounce player down
          if (window.audioSynth) {
            window.audioSynth.playBlockBump();
            setTimeout(() => window.audioSynth.playCoin(), 60);
          }
          this.player.coins += 2;
          this.player.score += 300;
          this.createSparkleParticles(block.x + 24, block.y, 12);
          this.updateHUD();
          // Show skill notification toast
          this.showSkillToast(block.category, block.skills);
        }
      }

      // Smooth bounce decay
      if (block.bounceY < 0) {
        block.bounceY += 1.5;
        if (block.bounceY > 0) block.bounceY = 0;
      }
    });

    // Ambient animation updates
    this.windmillAngle += 0.02;
    this.propellerAngle += 0.45;
    this.waterWaveOffset += 0.05;

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      p.vy += p.gravity || 0;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Fireworks
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const fw = this.fireworks[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.alpha -= 0.02;
      if (fw.alpha <= 0) {
        this.fireworks.splice(i, 1);
      }
    }

    // Emit ambient vehicle particles
    if (this.player.state === 'sub' && Math.random() < 0.25) {
      this.createBubbleParticles(this.player.x - 10, this.player.y + 30, 1);
    } else if (this.player.state === 'balloon' && Math.random() < 0.2) {
      this.createPuffParticles(this.player.x + 22, this.player.y + 70, 1);
    }

    // Sync progress bar with current world position
    const currentProgress = (this.player.x / (this.worldWidth - 1400)) * 100;
    const progressBar = document.getElementById('hud-progress-fill');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, currentProgress))}%`;
    }

    // Update Active Stage Indicator in HUD
    this.updateActiveStageIndicator();
  }

  updateHUD() {
    const coinEl = document.getElementById('hud-coin-count');
    const scoreEl = document.getElementById('hud-score-count');
    if (coinEl) coinEl.textContent = this.player.coins;
    if (scoreEl) scoreEl.textContent = this.player.score.toLocaleString();
  }

  updateActiveStageIndicator() {
    const stages = PORTFOLIO_DATA.stages || [];
    let currentStage = stages[0];
    for (let s of stages) {
      if (this.player.x >= s.worldX - 400) {
        currentStage = s;
      }
    }

    const stageTitleEl = document.getElementById('hud-stage-name');
    if (stageTitleEl && stageTitleEl.textContent !== currentStage.title) {
      stageTitleEl.textContent = currentStage.title;
    }

    // Update active nav button
    document.querySelectorAll('.stage-nav-btn').forEach((btn) => {
      const stageId = parseInt(btn.dataset.stage);
      if (stageId === currentStage.id) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  showSkillToast(category, items) {
    const toast = document.getElementById('skill-toast');
    if (!toast) return;
    const catEl = toast.querySelector('.toast-category');
    const listEl = toast.querySelector('.toast-list');
    if (catEl) catEl.textContent = `★ UNLOCKED: ${category} ★`;
    if (listEl) {
      listEl.innerHTML = items.map(s => `
        <div class="toast-item">
          <span>${s.icon} ${s.name}</span>
          <span class="toast-pct">${s.level}%</span>
        </div>
      `).join('');
    }
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }

  // --- RENDERING PIPELINE ---
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.scale(this.scale, this.scale);
    ctx.translate(-this.cameraX, 0);

    // 1. Render Sky & Far Backgrounds (Parallax 0.1x)
    this.renderBackgroundSky(ctx);

    // 2. Render Distant Mountains & Skylines (Parallax 0.25x)
    this.renderDistantScenery(ctx);

    // 3. Render Midground Hills, Trees, Windmills, Corals (Parallax 0.5x)
    this.renderMidground(ctx);

    // 4. Render Foreground Terrain & Biome Decor
    this.renderTerrain(ctx);

    // 5. Render Interactive Entities (Coins, Mystery Blocks, Kiosks, Chests)
    this.renderEntities(ctx);

    // 6. Render Particles
    this.renderParticles(ctx);

    // 7. Render Player Avatar
    this.renderPlayer(ctx);

    // 8. Render Foreground Water Reflections & Atmospheric Overlays
    this.renderAtmosphere(ctx);

    ctx.restore();
  }

  renderBackgroundSky(ctx) {
    const cam = this.cameraX;

    // Gradient that shifts seamlessly through the biomes:
    // Meadows (Sunny Cyan) -> Skills (Twilight Violet) -> Ocean (Azure Blue) -> Stratosphere (Starry Midnight) -> Citadel (Royal Dawn)
    const grad = ctx.createLinearGradient(cam, 0, cam + (this.width / this.scale), 0);
    
    // Calculate color based on camera position
    if (cam < 2600) {
      // Sunny Blue
      ctx.fillStyle = '#60a5fa';
      ctx.fillRect(cam, 0, this.width / this.scale, this.worldHeight);
      this.drawSun(ctx, cam + 800, 130);
    } else if (cam < 5600) {
      // Twilight Grove
      ctx.fillStyle = '#312e81';
      ctx.fillRect(cam, 0, this.width / this.scale, this.worldHeight);
      this.drawMoon(ctx, cam + 700, 110);
    } else if (cam < 8800) {
      // Ocean Depths
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cam, 0, this.width / this.scale, this.worldHeight);
      this.drawLightRays(ctx, cam);
    } else if (cam < 12000) {
      // Cosmic Stratosphere
      ctx.fillStyle = '#090d16';
      ctx.fillRect(cam, 0, this.width / this.scale, this.worldHeight);
      this.drawStars(ctx, cam);
    } else {
      // Golden Castle Sunset
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(cam, 0, this.width / this.scale, this.worldHeight);
      this.drawSun(ctx, cam + 500, 200, '#fbbf24');
    }

    // Parallax Clouds
    this.drawParallaxClouds(ctx, cam);
  }

  drawSun(ctx, x, y, color = '#fef08a') {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 48, 0, Math.PI * 2);
    ctx.fill();
    // Sun glow
    ctx.fillStyle = 'rgba(254, 240, 138, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, 76, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMoon(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(x, y, 38, 0, Math.PI * 2);
    ctx.fill();
    // Moon craters
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(x - 8, y - 6, 8, 0, Math.PI * 2);
    ctx.arc(x + 12, y + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawStars(ctx, cam) {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    // Deterministic twinkling stars
    for (let i = 0; i < 40; i++) {
      const sx = cam + ((i * 127) % (this.width / this.scale));
      const sy = 40 + ((i * 83) % 400);
      const twinkle = Math.sin(performance.now() * 0.003 + i) * 0.5 + 0.5;
      ctx.globalAlpha = 0.3 + twinkle * 0.7;
      ctx.fillRect(sx, sy, 2.5, 2.5);
    }
    ctx.restore();
  }

  drawLightRays(ctx, cam) {
    ctx.save();
    ctx.fillStyle = 'rgba(56, 189, 248, 0.07)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      const startX = cam + i * 220;
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX + 180, this.worldHeight);
      ctx.lineTo(startX + 120, this.worldHeight);
      ctx.lineTo(startX - 40, 0);
      ctx.fill();
    }
    ctx.restore();
  }

  drawParallaxClouds(ctx, cam) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    // 8 large pixel clouds
    for (let i = 0; i < 18; i++) {
      const cloudBaseX = i * 650;
      const cloudX = cloudBaseX - (cam * 0.25);
      const cloudY = 90 + (i % 4) * 55;
      
      // Draw retro cloud cluster
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 32, 0, Math.PI * 2);
      ctx.arc(cloudX + 30, cloudY - 14, 38, 0, Math.PI * 2);
      ctx.arc(cloudX + 65, cloudY, 32, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  renderDistantScenery(ctx) {
    const cam = this.cameraX;
    ctx.save();

    // Distant mountain ranges
    ctx.fillStyle = '#3b82f6';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.moveTo(cam, this.groundY);
    for (let x = cam - 200; x < cam + (this.width / this.scale) + 400; x += 180) {
      const peakY = this.groundY - 240 - Math.sin(x * 0.004) * 120;
      ctx.lineTo(x, peakY);
      ctx.lineTo(x + 90, this.groundY);
    }
    ctx.fill();
    ctx.restore();
  }

  renderMidground(ctx) {
    ctx.save();

    // Stage 1 Meadows: Turning Windmill & Pixel Trees
    const windmillX = 1400;
    this.drawWindmill(ctx, windmillX, this.groundY - 180);

    for (let tx = 300; tx < 2400; tx += 400) {
      this.drawTree(ctx, tx, this.groundY - 120);
    }

    // Stage 2 Skill Grove: Glowing Giant Mushrooms
    for (let mx = 2800; mx < 5400; mx += 500) {
      this.drawMushroom(ctx, mx, this.groundY - 130);
    }

    // Stage 3 Ocean: Coral Reefs & Floating Jellyfish
    for (let cx = 5800; cx < 8600; cx += 450) {
      this.drawCoral(ctx, cx, this.groundY - 60);
      this.drawJellyfish(ctx, cx + 180, this.groundY - 180);
    }

    // Stage 4 Stratosphere: Floating cloud platforms
    for (let ix = 9000; ix < 11800; ix += 600) {
      this.drawFloatingIsland(ctx, ix, this.groundY - 190);
    }

    // Stage 5 Citadel: Castle Towers & Flagpoles
    this.drawCastleTowers(ctx, 12800, this.groundY - 350);

    ctx.restore();
  }

  drawWindmill(ctx, x, y) {
    ctx.save();
    // Tower
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(x - 24, y + 180);
    ctx.lineTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.lineTo(x + 24, y + 180);
    ctx.fill();

    // Roof
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x, y - 26);
    ctx.lineTo(x + 20, y);
    ctx.fill();

    // Blades
    ctx.translate(x, y);
    ctx.rotate(this.windmillAngle);
    ctx.fillStyle = '#64748b';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-4, -65, 8, 65);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(4, -58, 16, 45);
      ctx.fillStyle = '#64748b';
    }
    ctx.restore();
  }

  drawTree(ctx, x, y) {
    ctx.save();
    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 10, y + 60, 20, 60);
    // Leaves (retro round puff)
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(x, y + 35, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x - 12, y + 25, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMushroom(ctx, x, y) {
    ctx.save();
    // Stem
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - 12, y + 50, 24, 80);
    // Cap
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.ellipse(x, y + 45, 50, 35, 0, Math.PI, 0);
    ctx.fill();
    // White polka dots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 22, y + 30, 8, 0, Math.PI * 2);
    ctx.arc(x + 18, y + 28, 10, 0, Math.PI * 2);
    ctx.arc(x, y + 16, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawCoral(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(x, y + 30, 24, 0, Math.PI * 2);
    ctx.arc(x + 22, y + 18, 18, 0, Math.PI * 2);
    ctx.arc(x - 18, y + 24, 16, 0, Math.PI * 2);
    ctx.fill();
    // Seaweed
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 60);
    ctx.quadraticCurveTo(x - 45, y + 10, x - 25, y - 20);
    ctx.stroke();
    ctx.restore();
  }

  drawJellyfish(ctx, x, y) {
    ctx.save();
    const bob = Math.sin(performance.now() * 0.003 + x) * 12;
    const jy = y + bob;
    ctx.fillStyle = 'rgba(216, 180, 254, 0.75)';
    ctx.beginPath();
    ctx.ellipse(x, jy, 22, 16, 0, Math.PI, 0);
    ctx.fill();
    // Tentacles
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
    ctx.lineWidth = 2;
    for (let i = -12; i <= 12; i += 6) {
      ctx.beginPath();
      ctx.moveTo(x + i, jy);
      ctx.lineTo(x + i + Math.sin(performance.now() * 0.005 + i) * 6, jy + 24);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawFloatingIsland(ctx, x, y) {
    ctx.save();
    const bob = Math.sin(performance.now() * 0.002 + x) * 8;
    const iy = y + bob;

    // Grass Top
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.roundRect(x - 100, iy, 200, 20, 8);
    ctx.fill();

    // Floating Earth Cone
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(x - 90, iy + 20);
    ctx.lineTo(x + 90, iy + 20);
    ctx.lineTo(x, iy + 90);
    ctx.fill();
    ctx.restore();
  }

  drawCastleTowers(ctx, x, y) {
    ctx.save();
    // Main Wall
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 120, y + 100, 240, 250);

    // Battlements
    for (let i = -120; i < 120; i += 30) {
      ctx.fillRect(x + i, y + 80, 20, 20);
    }

    // Towers
    ctx.fillStyle = '#334155';
    ctx.fillRect(x - 160, y + 40, 60, 310);
    ctx.fillRect(x + 100, y + 40, 60, 310);

    // Conical Roofs
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(x - 170, y + 40);
    ctx.lineTo(x - 130, y - 30);
    ctx.lineTo(x - 90, y + 40);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 90, y + 40);
    ctx.lineTo(x + 130, y - 30);
    ctx.lineTo(x + 170, y + 40);
    ctx.fill();

    // Grand Entrance Arch
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x, y + 250, 45, Math.PI, 0);
    ctx.lineTo(x + 45, y + 350);
    ctx.lineTo(x - 45, y + 350);
    ctx.fill();

    // Victory Flag
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(x - 130, y - 30);
    ctx.lineTo(x - 130, y - 75);
    ctx.lineTo(x - 85, y - 60);
    ctx.lineTo(x - 130, y - 45);
    ctx.fill();
    ctx.restore();
  }

  renderTerrain(ctx) {
    ctx.save();

    // 1. Stage 1 & 2 Grassland (x: 0 - 5600)
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, this.groundY, 5600, this.worldHeight - this.groundY);
    // Grass detail rim
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, this.groundY, 5600, 16);

    // 2. Stage 3 Ocean Basin (x: 5600 - 8800)
    // Water gradient
    const waterGrad = ctx.createLinearGradient(0, this.groundY - 260, 0, this.worldHeight);
    waterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.82)');
    waterGrad.addColorStop(1, 'rgba(3, 105, 161, 0.95)');
    ctx.fillStyle = waterGrad;
    ctx.fillRect(5600, this.groundY - 260, 3200, this.worldHeight - (this.groundY - 260));

    // Animated surface waves
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(5600, this.groundY - 260);
    for (let wx = 5600; wx <= 8800; wx += 40) {
      const wy = this.groundY - 260 + Math.sin((wx * 0.05) + this.waterWaveOffset) * 6;
      ctx.lineTo(wx, wy);
    }
    ctx.lineTo(8800, this.groundY - 250);
    ctx.lineTo(8800, this.groundY - 260);
    ctx.fill();

    // Ocean Sand Bed
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(5600, this.groundY + 30, 3200, this.worldHeight - (this.groundY + 30));

    // 3. Stage 4 Stratosphere Cloud Highway (x: 8800 - 12000)
    // Dreamy cloud banks
    ctx.fillStyle = '#f8fafc';
    for (let cx = 8800; cx <= 12000; cx += 120) {
      ctx.beginPath();
      ctx.arc(cx, this.groundY + 20, 75, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Stage 5 Citadel Stone Cobblestone (x: 12000 - 14200)
    ctx.fillStyle = '#334155';
    ctx.fillRect(12000, this.groundY, 2200, this.worldHeight - this.groundY);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(12000, this.groundY, 2200, 16);

    ctx.restore();
  }

  renderEntities(ctx) {
    ctx.save();

    // 1. Render Question Blocks and Brick Platforms
    this.blocks.forEach((block) => {
      const by = block.y + block.bounceY;
      if (block.type === 'question') {
        // Glowing gold question block
        ctx.fillStyle = block.hit ? '#94a3b8' : '#eab308';
        ctx.fillRect(block.x, by, block.w, block.h);
        // Bevel border
        ctx.strokeStyle = block.hit ? '#64748b' : '#ca8a04';
        ctx.lineWidth = 4;
        ctx.strokeRect(block.x, by, block.w, block.h);

        // '?' symbol
        ctx.fillStyle = block.hit ? '#475569' : '#ffffff';
        ctx.font = 'bold 26px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(block.hit ? '•' : '?', block.x + block.w / 2, by + block.h / 2);
      } else {
        // Brick block
        ctx.fillStyle = '#b45309';
        ctx.fillRect(block.x, by, block.w, block.h);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.strokeRect(block.x, by, block.w, block.h);
      }
    });

    // 2. Render Coins & Gems
    this.coins.forEach((coin) => {
      if (!coin.collected) {
        ctx.save();
        ctx.translate(coin.x, coin.y);
        const spin = Math.sin(performance.now() * 0.006 + coin.x);
        ctx.scale(spin, 1);

        if (coin.isGem) {
          // Radiant Victory Gem
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(0, -18);
          ctx.lineTo(16, 0);
          ctx.lineTo(0, 18);
          ctx.lineTo(-16, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Gold Coin
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    });

    // 3. Render Sunken Treasure Chests (Career Milestones in Stage 3)
    this.chests.forEach((chest) => {
      ctx.save();
      ctx.translate(chest.x, chest.y);

      // Chest Body
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(0, 12, chest.w, chest.h - 12);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(chest.w / 2 - 6, 22, 12, 14); // Lock plate

      // Chest Curved Lid
      ctx.fillStyle = '#a16207';
      ctx.beginPath();
      ctx.ellipse(chest.w / 2, 12, chest.w / 2, 14, 0, Math.PI, 0);
      ctx.fill();

      // Gold bands
      ctx.fillStyle = '#eab308';
      ctx.fillRect(10, 12, 6, chest.h - 12);
      ctx.fillRect(chest.w - 16, 12, 6, chest.h - 12);

      // Floating Info Banner above chest
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.roundRect(-30, -55, chest.w + 60, 44, 8);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(chest.data.company, chest.w / 2, -35);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText(chest.data.year, chest.w / 2, -18);

      ctx.restore();
    });

    // 4. Render Sky Arcade Project Kiosks (Stage 4)
    this.kiosks.forEach((kiosk) => {
      ctx.save();
      ctx.translate(kiosk.x, kiosk.y);

      // Arcade Cabinet Shell
      ctx.fillStyle = '#1e1b4b';
      ctx.roundRect(-40, -110, 80, 120, 10);
      ctx.fill();
      ctx.strokeStyle = kiosk.data.color || '#6366f1';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-30, -95, 60, 50);

      // Screen icon
      ctx.font = '24px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(kiosk.data.icon, 0, -70);

      // Controls panel
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(-12, -30, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(8, -30, 5, 0, Math.PI * 2);
      ctx.fill();

      // Floating Title Badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.roundRect(-80, -155, 160, 36, 6);
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(kiosk.data.title, 0, -137);

      ctx.restore();
    });

    // 5. Render Stage 1 Welcome Sign
    this.drawWelcomeSign(ctx, 350, this.groundY - 140);

    // 6. Render Stage 5 Victory Flagpole
    this.drawFlagpole(ctx, 13400, this.groundY - 320);

    ctx.restore();
  }

  drawWelcomeSign(ctx, x, y) {
    ctx.save();
    // Wooden posts
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 10, y + 40, 10, 100);
    ctx.fillRect(x + 160, y + 40, 10, 100);

    // Signboard
    ctx.fillStyle = '#b45309';
    ctx.roundRect(x - 10, y, 200, 60, 6);
    ctx.fill();
    ctx.strokeStyle = '#fef3c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("ALEX'S PORTFOLIO", x + 90, y + 25);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText("★ SCROLL / PLAY TO EXPLORE ★", x + 90, y + 45);
    ctx.restore();
  }

  drawFlagpole(ctx, x, y) {
    ctx.save();
    // Pole
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(x, y, 8, 320);
    // Gold finial top ball
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(x + 4, y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Waving Mario-style flag
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 20);
    ctx.lineTo(x + 65, y + 45);
    ctx.lineTo(x + 8, y + 70);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui';
    ctx.fillText('★', x + 24, y + 50);
    ctx.restore();
  }

  // --- PLAYER RENDERING (MULTI-FORM) ---
  renderPlayer(ctx) {
    const p = this.player;
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.facing === -1) {
      ctx.translate(p.width, 0);
      ctx.scale(-1, 1);
    }

    if (p.state === 'walk' || p.state === 'castle') {
      this.drawHumanSprite(ctx, p);
    } else if (p.state === 'sub') {
      this.drawSubmarineSprite(ctx, p);
    } else if (p.state === 'balloon') {
      this.drawBalloonSprite(ctx, p);
    }

    ctx.restore();
  }

  drawHumanSprite(ctx, p) {
    const avatar = (PORTFOLIO_DATA.profile && PORTFOLIO_DATA.profile.avatar) || {};
    const shirtColor = avatar.shirtColor || '#3b82f6';
    const pantsColor = avatar.pantsColor || '#1e293b';
    const hatColor = avatar.hatColor || '#ef4444';
    const skinColor = avatar.skinColor || '#fcd34d';
    const hairColor = avatar.hairColor || '#451a03';

    // Walk bob & limb swing
    const isWalking = Math.abs(p.vx) > 0.5 || p.animTimer > 0;
    const swing = isWalking ? Math.sin(p.animTimer * 10) : 0;

    // Head / Cap
    ctx.fillStyle = hatColor;
    ctx.fillRect(10, 4, 24, 12);
    ctx.fillRect(20, 10, 16, 6); // Cap visor
    
    // Hair
    ctx.fillStyle = hairColor;
    ctx.fillRect(8, 14, 8, 10);

    // Face / Skin
    ctx.fillStyle = skinColor;
    ctx.fillRect(14, 14, 18, 14);

    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(26, 18, 4, 5);

    // Shirt / Torso
    ctx.fillStyle = shirtColor;
    ctx.fillRect(10, 28, 24, 20);

    // Arms
    ctx.fillStyle = skinColor;
    const armAngle = swing * 0.4;
    ctx.fillRect(6 + swing * 4, 30, 8, 14);

    // Legs / Pants
    ctx.fillStyle = pantsColor;
    const legOffset1 = swing * 8;
    const legOffset2 = -swing * 8;
    ctx.fillRect(10 + legOffset1, 48, 10, 16);
    ctx.fillRect(24 + legOffset2, 48, 10, 16);

    // Shoes
    ctx.fillStyle = '#78350f';
    ctx.fillRect(10 + legOffset1, 60, 12, 6);
    ctx.fillRect(24 + legOffset2, 60, 12, 6);
  }

  drawSubmarineSprite(ctx, p) {
    // Yellow Mini-Submarine
    ctx.save();
    // Sub Hull
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(22, 32, 38, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Conning Tower / Periscope
    ctx.fillStyle = '#eab308';
    ctx.fillRect(12, 10, 18, 14);
    ctx.fillRect(20, 2, 6, 10);
    ctx.fillRect(20, 2, 12, 6); // Lens

    // Glass Porthole with Player Face
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(28, 32, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Smiling face inside porthole
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.arc(28, 33, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(29, 31, 2, 3); // Eye

    // Propeller (rotating)
    ctx.save();
    ctx.translate(-14, 32);
    ctx.rotate(this.propellerAngle);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-3, -14, 6, 28);
    ctx.restore();

    // Underwater Spotlight Beam
    ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
    ctx.beginPath();
    ctx.moveTo(56, 32);
    ctx.lineTo(180, -20);
    ctx.lineTo(180, 84);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawBalloonSprite(ctx, p) {
    // Hot Air Balloon Aeronaut
    ctx.save();
    // Striped Balloon
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(22, -25, 42, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(22, -25, 18, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ropes
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(8, 30);
    ctx.moveTo(54, -5);
    ctx.lineTo(36, 30);
    ctx.stroke();

    // Wicker Basket
    ctx.fillStyle = '#92400e';
    ctx.fillRect(6, 30, 32, 26);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(6, 30, 32, 26);

    // Player in Basket waving
    this.drawHumanSprite(ctx, { ...p, y: 14 });

    // Burner flame
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(18, 14);
    ctx.lineTo(22, 2);
    ctx.lineTo(26, 14);
    ctx.fill();

    ctx.restore();
  }

  // --- PARTICLE EMITTERS ---
  createDustParticles(x, y, count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        alpha: 0.8,
        decay: 0.04,
        color: '#cbd5e1',
        size: Math.random() * 4 + 3
      });
    }
  }

  createSparkleParticles(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        alpha: 1,
        decay: 0.03,
        color: ['#fde047', '#38bdf8', '#f43f5e', '#a855f7'][Math.floor(Math.random() * 4)],
        size: Math.random() * 5 + 3,
        gravity: 0.1
      });
    }
  }

  createBubbleParticles(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 14 - 7),
        y: y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -Math.random() * 2 - 1.5,
        alpha: 0.75,
        decay: 0.015,
        color: 'rgba(255, 255, 255, 0.7)',
        size: Math.random() * 5 + 3
      });
    }
  }

  createPuffParticles(x, y, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 2 + 1,
        alpha: 0.85,
        decay: 0.03,
        color: '#fdba74',
        size: Math.random() * 6 + 4
      });
    }
  }

  createSplashParticles(x, y) {
    for (let i = 0; i < 24; i++) {
      this.particles.push({
        x: x + (Math.random() * 40 - 20),
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 8 - 4,
        alpha: 1,
        decay: 0.025,
        color: '#e0f2fe',
        size: Math.random() * 5 + 4,
        gravity: 0.3
      });
    }
  }

  spawnFireworks(x, y) {
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#facc15'];
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 7 + 2;
      this.fireworks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2
      });
    }
  }

  renderParticles(ctx) {
    // Normal particles
    this.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Fireworks
    this.fireworks.forEach((fw) => {
      ctx.save();
      ctx.globalAlpha = fw.alpha;
      ctx.fillStyle = fw.color;
      ctx.beginPath();
      ctx.arc(fw.x, fw.y, fw.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  renderAtmosphere(ctx) {
    // Vignette / subtle cinematic edges
    ctx.save();
    // Ambient floating fireflies in Skill Grove
    if (this.cameraX > 2200 && this.cameraX < 5800) {
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 15; i++) {
        const fx = 2600 + ((i * 197 + performance.now() * 0.02) % 2800);
        const fy = this.groundY - 180 + Math.sin(performance.now() * 0.003 + i) * 60;
        const glow = Math.sin(performance.now() * 0.005 + i) * 0.4 + 0.6;
        ctx.globalAlpha = glow * 0.7;
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Check proximity for interactive modals (Chests, Kiosks)
  checkInteractions() {
    const px = this.player.x;

    // Check project kiosks
    for (let k of this.kiosks) {
      if (Math.abs(px - k.x) < 90) {
        if (window.showProjectModal) {
          window.showProjectModal(k.data);
          return;
        }
      }
    }

    // Check experience chests
    for (let c of this.chests) {
      if (Math.abs(px - c.x) < 80) {
        if (window.showExperienceModal) {
          window.showExperienceModal(c.data);
          return;
        }
      }
    }
  }

  // Teleport player to a specific stage
  warpToStage(stageId) {
    const stages = PORTFOLIO_DATA.stages || [];
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    this.setManualMode();
    this.player.x = stage.worldX + 150;
    this.player.vx = 0;
    this.player.vy = 0;
    if (window.audioSynth) {
      window.audioSynth.playJump();
    }
    this.createSparkleParticles(this.player.x + 22, this.player.y + 32, 16);
  }
}

window.GameEngine = GameEngine;
