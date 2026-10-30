/**
 * PORTFOLIO DATA CONFIGURATION
 * 
 * Customize your game portfolio content here!
 * All sections, skills, work history, projects, and contact details
 * are cleanly structured and can be updated at any time.
 */

const PORTFOLIO_DATA = {
  // Personal & Profile Info
  profile: {
    name: "Alex Morgan",
    characterName: "Pixel Alex",
    tagline: "Full-Stack Developer & Creative Technologist",
    subtitle: "Level 99 Code Wizard • Architecting High-Impact Digital Experiences",
    location: "San Francisco, CA / Remote",
    avatar: {
      shirtColor: "#3b82f6",     // Hero shirt color
      pantsColor: "#1e293b",     // Hero pants color
      hatColor: "#ef4444",       // Cap color
      skinColor: "#fcd34d",      // Pixel skin tone
      hairColor: "#451a03"       // Hair color
    },
    bio: [
      "Welcome to my interactive adventure! I am a passionate full-stack engineer, creative technologist, and digital artisan dedicated to crafting blazingly fast, accessible, and delightful interactive web experiences.",
      "With 5+ years of engineering across web systems, distributed backends, and creative interactive canvas/WebGL graphics, I bridge the gap between engineering rigor and playful human-centered design."
    ],
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "alex.morgan.developer@example.com",
      resumePdf: "#resume-pdf"
    }
  },

  // Game World Stage Milestones
  stages: [
    { id: 1, name: "Meadows", title: "Genesis Meadows", subtitle: "Origins & Bio", worldX: 0 },
    { id: 2, name: "Skills", title: "Skill Grove", subtitle: "Tech Arsenal", worldX: 2800 },
    { id: 3, name: "Journey", title: "Ocean Trench", subtitle: "Career Milestones", worldX: 5800 },
    { id: 4, name: "Projects", title: "Stratosphere", subtitle: "Featured Creations", worldX: 9200 },
    { id: 5, name: "Contact", title: "Victory Citadel", subtitle: "Get in Touch", worldX: 12600 }
  ],

  // Skills Data (Displayed on interactive Mario-style pillars in Stage 2)
  skills: [
    {
      category: "Frontend & UI",
      color: "#3b82f6",
      icon: "⚡",
      items: [
        { name: "TypeScript / JS", level: 95, icon: "📜" },
        { name: "React / Next.js", level: 92, icon: "⚛️" },
        { name: "HTML5 / Canvas / WebGL", level: 88, icon: "🎨" },
        { name: "Modern CSS / Tailwind", level: 94, icon: "💅" },
        { name: "Vue / Svelte", level: 82, icon: "🔥" }
      ]
    },
    {
      category: "Backend & Systems",
      color: "#10b981",
      icon: "⚙️",
      items: [
        { name: "Node.js / Express", level: 90, icon: "🟢" },
        { name: "Python / FastAPI", level: 86, icon: "🐍" },
        { name: "PostgreSQL / Redis", level: 88, icon: "🐘" },
        { name: "GraphQL & REST APIs", level: 92, icon: "🌐" },
        { name: "Go / Microservices", level: 78, icon: "🔷" }
      ]
    },
    {
      category: "Cloud, DevOps & Tools",
      color: "#f59e0b",
      icon: "🚀",
      items: [
        { name: "Docker & Kubernetes", level: 84, icon: "🐳" },
        { name: "AWS & Cloudflare", level: 88, icon: "☁️" },
        { name: "Git / CI/CD Pipelines", level: 95, icon: "🔀" },
        { name: "Testing (Jest, Playwright)", level: 86, icon: "🧪" },
        { name: "Linux Systems", level: 85, icon: "🐧" }
      ]
    }
  ],

  // Experience Milestones (Displayed underwater / submarine in Stage 3)
  experience: [
    {
      id: "exp-1",
      year: "2023 - Present",
      role: "Senior Full-Stack Engineer",
      company: "Nexus Hypermedia Labs",
      badge: "Staff Tech Lead",
      color: "#38bdf8",
      description: "Spearheaded the core interactive rendering engine and web architecture serving over 4.5M active monthly users. Improved Core Web Vitals LCP by 42% and introduced micro-frontend architecture.",
      highlights: [
        "Architected distributed real-time sync engine utilizing WebSockets and Redis clusters",
        "Mentored a cross-functional squad of 8 frontend and backend engineers",
        "Pioneered Canvas-accelerated interactive data visualization modules"
      ],
      technologies: ["React", "TypeScript", "Node.js", "Redis", "Docker", "AWS"]
    },
    {
      id: "exp-2",
      year: "2021 - 2023",
      role: "Full-Stack Software Engineer",
      company: "Vanguard Digital Systems",
      badge: "Core Platform",
      color: "#a855f7",
      description: "Built mission-critical SaaS enterprise dashboards, payment integrations, and high-throughput REST & GraphQL data services with 99.99% uptime.",
      highlights: [
        "Reduced database query latency by 65% through indexing and caching optimizations",
        "Engineered automated multi-stage CI/CD pipeline decreasing deployment cycle from 45m to 4m",
        "Developed custom design system components used by 12 internal product teams"
      ],
      technologies: ["Next.js", "Python", "FastAPI", "PostgreSQL", "TailwindCSS"]
    },
    {
      id: "exp-3",
      year: "2019 - 2021",
      role: "Frontend Developer & UI Engineer",
      company: "Pixel Craft Interactive",
      badge: "Creative Tech",
      color: "#34d399",
      description: "Crafted award-winning interactive promotional sites, immersive 3D landing experiences, and responsive mobile-first web applications for global brand clients.",
      highlights: [
        "Delivered 18+ high-profile client launch sites on tight deadlines with 100% on-time record",
        "Won Awwwards Site of the Day for innovative interactive storytelling experience",
        "Optimized asset pipelines reducing bundle sizes by 50% across key flagship projects"
      ],
      technologies: ["JavaScript", "HTML5 Canvas", "WebGL / Three.js", "CSS3 / GSAP"]
    }
  ],

  // Projects Showcase (Displayed on Floating Sky Islands / Arcade Kiosks in Stage 4)
  projects: [
    {
      id: "proj-1",
      title: "HyperFlow Engine",
      subtitle: "High-Performance 2D Physics & Particle Web Engine",
      badge: "Featured Creation",
      color: "#6366f1",
      icon: "🌌",
      description: "A lightweight, zero-dependency 2D physics simulation and particle accelerator running natively in the browser via WebGL and HTML5 Canvas. Supports over 50,000 active particles at 60 FPS.",
      highlights: [
        "Spatial grid hash partitioning for O(N log N) collision resolution",
        "Procedural particle emitters with custom shader pipelines",
        "Integrated interactive web playground and benchmarking suite"
      ],
      tags: ["WebGL", "TypeScript", "Canvas 2D", "Math & Physics"],
      demoUrl: "https://example.com/hyperflow-demo",
      githubUrl: "https://github.com/example/hyperflow-engine"
    },
    {
      id: "proj-2",
      title: "OmniMetrics Cloud",
      subtitle: "Real-Time Distributed Telemetry Dashboard",
      badge: "SaaS Platform",
      color: "#06b6d4",
      icon: "📊",
      description: "An enterprise telemetry monitoring dashboard that visualizes high-frequency system metrics, CPU/memory telemetry, and error anomaly alerts in real time with sub-100ms latency.",
      highlights: [
        "Streaming WebSocket pipeline processing 10k events/sec",
        "Dynamic time-series visualizations with customizable threshold alerts",
        "Role-based access control with audited security logs"
      ],
      tags: ["React", "FastAPI", "TimescaleDB", "Docker", "TailwindCSS"],
      demoUrl: "https://example.com/omni-metrics",
      githubUrl: "https://github.com/example/omni-metrics"
    },
    {
      id: "proj-3",
      title: "ChronoSync Collab",
      subtitle: "Zero-Latency Collaborative Workspace & Whiteboard",
      badge: "Open Source",
      color: "#ec4899",
      icon: "✏️",
      description: "A multiplayer infinite-canvas collaboration tool with offline-first CRDT synchronization, presence indicators, real-time cursor sharing, and audio room integration.",
      highlights: [
        "Conflict-free replicated data types (Yjs CRDTs) for effortless peer sync",
        "Smooth vector pen strokes with dynamic pressure interpolation",
        "Zero-latency local optimistic updates with background ledger reconciliation"
      ],
      tags: ["Next.js", "CRDT", "WebRTC", "Canvas", "Tailwind"],
      demoUrl: "https://example.com/chronosync",
      githubUrl: "https://github.com/example/chronosync"
    },
    {
      id: "proj-4",
      title: "RetroSynth 8-Bit",
      subtitle: "Browser-Based Modular Chiptune Synthesizer",
      badge: "Audio & Web API",
      color: "#f59e0b",
      icon: "🎹",
      description: "A nostalgic 8-bit sound design studio powered purely by the Web Audio API. Users can compose melodies, design retro sound effects, and export MIDI/WAV samples.",
      highlights: [
        "Custom square, triangle, sawtooth and white-noise oscillators",
        "16-step polyphonic tracker sequencer with pattern memory",
        "Zero external audio libraries; pure native Web Audio synthesis"
      ],
      tags: ["Web Audio API", "Vanilla JS", "DSP", "CSS Grid"],
      demoUrl: "https://example.com/retrosynth",
      githubUrl: "https://github.com/example/retrosynth"
    }
  ],

  // Awards & Recognition (Stage 5 Trophy Room)
  awards: [
    { year: "2024", title: "Top Developer Innovation Award", organization: "Tech Horizons Global" },
    { year: "2023", title: "Awwwards Site of the Day", organization: "Awwwards" },
    { year: "2022", title: "1st Place Hackathon Grand Prize", organization: "Global FinTech Hack" },
    { year: "2021", title: "Open Source Contributor of the Year", organization: "WebDev Community" }
  ],

  // Collectible Game Items scattered across the world
  collectiblesTotal: 25
};

// Make accessible to all scripts
window.PORTFOLIO_DATA = PORTFOLIO_DATA;
