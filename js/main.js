/**
 * MAIN CONTROLLER & APPLICATION ORCHESTRATOR
 * 
 * Coordinates:
 * - Game Engine lifecycle & canvas events
 * - Dual Input: Smooth Scroll syncing + Arcade gamepad
 * - HUD bindings & Stage Warp navigation
 * - Recruiter Fast-View modal population & printing
 * - Interactive Project, Experience & Contact modal controllers
 * - Audio synthesizers and persistence
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Game Engine
  const engine = new GameEngine('game-canvas');
  window.gameEngine = engine;

  // 2. Setup Scroll-Driven Progression (Robby Leonardi style)
  let virtualScroll = 0;
  const maxScroll = 10000; // Total virtual scroll length
  let isScrolling = false;
  let scrollVelocity = 0;

  // Mouse wheel listener with momentum
  window.addEventListener('wheel', (e) => {
    // If a modal is open, let the user scroll inside the modal normally
    const openModal = document.querySelector('dialog[open]');
    if (openModal) return;

    e.preventDefault();
    virtualScroll += e.deltaY * 1.5;
    virtualScroll = Math.max(0, Math.min(maxScroll, virtualScroll));
    engine.updateFromScroll(virtualScroll / maxScroll);
  }, { passive: false });

  // Touch swipe support for smooth scrolling on mobile
  let touchStartY = 0;
  let touchStartX = 0;

  window.addEventListener('touchstart', (e) => {
    const openModal = document.querySelector('dialog[open]');
    if (openModal) return;
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    const openModal = document.querySelector('dialog[open]');
    if (openModal) return;
    // Don't intercept if touching virtual control buttons
    if (e.target.closest('#mobile-controls')) return;

    if (e.touches.length === 1) {
      const deltaY = touchStartY - e.touches[0].clientY;
      const deltaX = touchStartX - e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartX = e.touches[0].clientX;

      // Use dominant swipe direction
      const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
      virtualScroll += delta * 2.2;
      virtualScroll = Math.max(0, Math.min(maxScroll, virtualScroll));
      engine.updateFromScroll(virtualScroll / maxScroll);
    }
  }, { passive: true });

  // 3. Audio Toggle Controller
  const audioBtn = document.getElementById('btn-audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const audioText = document.getElementById('audio-text');

  const updateAudioUI = () => {
    const muted = window.audioSynth ? window.audioSynth.isMuted : false;
    if (audioIcon && audioText) {
      audioIcon.textContent = muted ? '🔇' : '🔊';
      audioText.textContent = muted ? 'Audio Muted' : 'Audio On';
    }
  };

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (window.audioSynth) {
        const isMuted = window.audioSynth.toggleMute();
        updateAudioUI();
        if (!isMuted) {
          window.audioSynth.playClick();
        }
      }
    });
    updateAudioUI();
  }

  // 4. Stage Teleport Navigation
  document.querySelectorAll('.stage-nav-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const stageId = parseInt(btn.dataset.stage);
      engine.warpToStage(stageId);

      // Sync virtual scroll
      const stages = PORTFOLIO_DATA.stages || [];
      const stage = stages.find(s => s.id === stageId);
      if (stage) {
        virtualScroll = (stage.worldX / (engine.worldWidth - 1400)) * maxScroll;
      }
    });
  });

  // 5. Populate Profile in HUD & Recruiter CV
  populateProfileData();

  // 6. Recruiter CV Modal Controller
  const cvModal = document.getElementById('recruiter-modal');
  const btnRecruiterCV = document.getElementById('btn-recruiter-cv');
  const btnPrintCV = document.getElementById('btn-print-cv');

  if (btnRecruiterCV && cvModal) {
    btnRecruiterCV.addEventListener('click', () => {
      if (window.audioSynth) window.audioSynth.playClick();
      cvModal.showModal();
    });
  }

  if (btnPrintCV) {
    btnPrintCV.addEventListener('click', () => {
      window.print();
    });
  }

  // 7. Modal Close Buttons and Backdrop Click
  document.querySelectorAll('.modal-close-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = btn.dataset.close;
      const modal = document.getElementById(modalId);
      if (modal) {
        if (window.audioSynth) window.audioSynth.playClick();
        modal.close();
      }
    });
  });

  // Close modals when clicking backdrop
  document.querySelectorAll('dialog.modal-dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });

  // 8. Canvas Pointer Clicks (Click on project kiosks, chests, or citadel to open)
  const canvas = document.getElementById('game-canvas');
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / engine.scale + engine.cameraX;
    const clickY = (e.clientY - rect.top) / engine.scale;

    // Check project kiosks in Stage 4
    for (let k of engine.kiosks) {
      if (Math.abs(clickX - k.x) < 55 && clickY >= k.y - 120 && clickY <= k.y + 20) {
        window.showProjectModal(k.data);
        return;
      }
    }

    // Check treasure chests in Stage 3
    for (let c of engine.chests) {
      if (Math.abs(clickX - c.x) < 45 && clickY >= c.y - 40 && clickY <= c.y + 55) {
        window.showExperienceModal(c.data);
        return;
      }
    }

    // Check Castle / Flagpole in Stage 5
    if (clickX >= 12600 && clickY <= engine.groundY) {
      window.showContactModal();
      return;
    }
  });

  // Start gentle background melody on first interactive click
  const handleFirstInteraction = () => {
    if (window.audioSynth) {
      window.audioSynth.init();
      window.audioSynth.resume();
    }
    window.removeEventListener('pointerdown', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
  };
  window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
  window.addEventListener('keydown', handleFirstInteraction, { once: true });
});

/**
 * Populate Recruiter CV Modal and Profile Info from PORTFOLIO_DATA
 */
function populateProfileData() {
  const data = window.PORTFOLIO_DATA;
  if (!data) return;

  // 1. HUD Player Name
  const hudPlayerName = document.getElementById('hud-player-name');
  if (hudPlayerName) hudPlayerName.textContent = data.profile.characterName || data.profile.name;

  // 2. CV Header
  const cvName = document.getElementById('cv-name');
  const cvSubtitle = document.getElementById('cv-subtitle');
  const cvBio = document.getElementById('cv-bio');
  const cvEmail = document.getElementById('cv-email-link');
  const cvGithub = document.getElementById('cv-github-link');
  const cvLinkedin = document.getElementById('cv-linkedin-link');

  if (cvName) cvName.textContent = data.profile.name;
  if (cvSubtitle) cvSubtitle.textContent = `${data.profile.tagline} • ${data.profile.location}`;
  if (cvBio) cvBio.textContent = data.profile.bio.join(' ');
  if (cvEmail) cvEmail.href = `mailto:${data.profile.social.email}`;
  if (cvGithub) cvGithub.href = data.profile.social.github;
  if (cvLinkedin) cvLinkedin.href = data.profile.social.linkedin;

  // 3. Technical Skills
  const skillsContainer = document.getElementById('cv-skills-container');
  if (skillsContainer && data.skills) {
    skillsContainer.innerHTML = data.skills.map(cat => `
      <div>
        <h4 style="font-size: 15px; color: ${cat.color}; margin-bottom: 8px;">${cat.icon} ${cat.category}</h4>
        <div class="tags-grid">
          ${cat.items.map(item => `
            <span class="tag-badge" style="border-color: ${cat.color}40; color: #f8fafc;">
              ${item.icon} ${item.name} (${item.level}%)
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // 4. Experience Timeline
  const expContainer = document.getElementById('cv-experience-container');
  if (expContainer && data.experience) {
    expContainer.innerHTML = data.experience.map(exp => `
      <div class="cv-item">
        <div class="cv-item-header">
          <div>
            <span class="cv-role">${exp.role}</span>
            <span class="cv-company"> @ ${exp.company}</span>
          </div>
          <span class="cv-period">${exp.year}</span>
        </div>
        <p class="cv-desc">${exp.description}</p>
        <ul class="cv-bullets">
          ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <div class="tags-grid" style="margin-top: 10px;">
          ${exp.technologies.map(t => `<span class="tag-badge">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // 5. Featured Projects
  const projContainer = document.getElementById('cv-projects-container');
  if (projContainer && data.projects) {
    projContainer.innerHTML = data.projects.map(p => `
      <div class="cv-item" style="border-color: ${p.color};">
        <div class="cv-item-header">
          <span class="cv-role">${p.icon} ${p.title}</span>
          <span class="tag-badge" style="background: ${p.color}30; color: #ffffff;">${p.badge}</span>
        </div>
        <p class="cv-desc">${p.description}</p>
        <ul class="cv-bullets">
          ${p.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <div class="tags-grid" style="margin-top: 10px;">
          ${p.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
        </div>
      </div>
    `).join('');
  }

  // 6. Awards
  const awardsList = document.getElementById('cv-awards-list');
  if (awardsList && data.awards) {
    awardsList.innerHTML = data.awards.map(a => `
      <li style="margin-bottom: 6px;">
        <strong>${a.year}:</strong> ${a.title} — <em>${a.organization}</em>
      </li>
    `).join('');
  }
}

/**
 * Show Project Detail Modal
 */
window.showProjectModal = function(proj) {
  if (!proj) return;
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  if (window.audioSynth) window.audioSynth.playClick();

  document.getElementById('proj-modal-title').textContent = `${proj.icon} ${proj.title}`;
  document.getElementById('proj-modal-subtitle').textContent = proj.subtitle;
  document.getElementById('proj-modal-badge').textContent = proj.badge;
  document.getElementById('proj-modal-desc').textContent = proj.description;

  const highlightsEl = document.getElementById('proj-modal-highlights');
  if (highlightsEl) {
    highlightsEl.innerHTML = proj.highlights.map(h => `<li>${h}</li>`).join('');
  }

  const tagsEl = document.getElementById('proj-modal-tags');
  if (tagsEl) {
    tagsEl.innerHTML = proj.tags.map(t => `<span class="tag-badge">${t}</span>`).join('');
  }

  const demoBtn = document.getElementById('proj-modal-demo');
  const githubBtn = document.getElementById('proj-modal-github');
  if (demoBtn) demoBtn.href = proj.demoUrl;
  if (githubBtn) githubBtn.href = proj.githubUrl;

  modal.showModal();
};

/**
 * Show Experience Milestone Modal
 */
window.showExperienceModal = function(exp) {
  if (!exp) return;
  const modal = document.getElementById('experience-modal');
  if (!modal) return;

  if (window.audioSynth) window.audioSynth.playSonar();

  document.getElementById('exp-modal-role').textContent = exp.role;
  document.getElementById('exp-modal-company').textContent = `@ ${exp.company}`;
  document.getElementById('exp-modal-year').textContent = `📅 ${exp.year}`;
  document.getElementById('exp-modal-desc').textContent = exp.description;

  const highlightsEl = document.getElementById('exp-modal-highlights');
  if (highlightsEl) {
    highlightsEl.innerHTML = exp.highlights.map(h => `<li>${h}</li>`).join('');
  }

  const techEl = document.getElementById('exp-modal-tech');
  if (techEl) {
    techEl.innerHTML = exp.technologies.map(t => `<span class="tag-badge">${t}</span>`).join('');
  }

  modal.showModal();
};

/**
 * Show Contact Terminal Modal
 */
window.showContactModal = function() {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  if (window.audioSynth) window.audioSynth.playFanfare();
  modal.showModal();
};

/**
 * Handle Contact Form Submission
 */
window.handleContactSubmit = function() {
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const message = document.getElementById('contact-message').value;

  if (window.audioSynth) {
    window.audioSynth.playFanfare();
  }

  // Trigger celebration fireworks in game engine
  if (window.gameEngine) {
    window.gameEngine.spawnFireworks(window.gameEngine.player.x, 300);
  }

  alert(`🎉 Thank you, ${name}! Your transmission has been dispatched successfully! I will get in touch with you at ${email} soon.`);
  
  const modal = document.getElementById('contact-modal');
  if (modal) modal.close();

  document.getElementById('contact-form').reset();
};
