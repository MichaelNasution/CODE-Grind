// ============================================================
// KalehDesign — Main JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Menu Toggle ──
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');
  const menuLinks = document.querySelectorAll('.side-menu-link');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    sideMenu.classList.toggle('open');
    document.body.style.overflow = sideMenu.classList.contains('open') ? 'hidden' : '';
  });

  menuLinks.forEach((link, i) => {
    link.style.transitionDelay = `${i * 0.06}s`;
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      sideMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ── Copy Install Command ──
  document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText('npm i kalehdesign');
    const btn = document.getElementById('copy-btn');
    btn.innerHTML = '✓';
    setTimeout(() => {
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    }, 1500);
  });

  // ── Hero Canvas Animation (animejs.com v3 Replica) ──
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, cx, cy;
    
    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      W = rect.width;
      H = rect.height;
      cx = W / 2;
      cy = H / 2;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let t = 0;
    function drawHero() {
      t += 0.005;
      ctx.clearRect(0, 0, W, H);
      const r = Math.min(W, H) * 0.42;

      // 1. Outer Gradient Ring
      const segments = [
        { color: '#18FF92', start: Math.PI, end: Math.PI * 1.48 },
        { color: '#FF4B4B', start: Math.PI * 1.52, end: Math.PI * 1.98 },
        { color: '#FF8A3D', start: Math.PI * 2.02, end: Math.PI * 2.2 },
        { color: '#FFB885', start: Math.PI * 2.22, end: Math.PI * 2.48 },
        { color: '#5A87FF', start: Math.PI * 2.52, end: Math.PI * 2.8 },
        { color: '#26D5FF', start: Math.PI * 2.82, end: Math.PI * 2.98 }
      ];
      
      ctx.lineWidth = 4;
      segments.forEach(seg => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, seg.start, seg.end);
        ctx.strokeStyle = seg.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = seg.color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 2. Inner Tick Marks (rotating slowly)
      ctx.lineWidth = 1;
      const tickCount = 120;
      for (let i = 0; i < tickCount; i++) {
        const angle = (i / tickCount) * Math.PI * 2 + t * 0.5;
        const isLong = i % 10 === 0;
        const innerR = r * (isLong ? 0.9 : 0.95);
        const outerR = r * 0.98;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.strokeStyle = `rgba(255,255,255,${isLong ? 0.4 : 0.1})`;
        ctx.stroke();
      }

      // 3. Inner Dark Circular Backgrounds
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fill();
      
      for(let i=0; i<4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, r * (0.8 - i*0.06), t * (1 + i*0.4), t * (1 + i*0.4) + Math.PI*(0.5 + i*0.2));
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 4. Center Hatching (Audio visualizer style)
      const hatchWidth = r * 1.4;
      const hatchHeight = r * 0.8;
      const lineSpacing = 5;
      ctx.lineWidth = 1.5;
      for(let y = -hatchHeight/2; y <= hatchHeight/2; y += lineSpacing) {
        const envelope = Math.sin((y + hatchHeight/2) / hatchHeight * Math.PI);
        const dynamicWidth = hatchWidth * envelope * (0.85 + 0.15 * Math.sin(t * 15 + y * 0.1));
        
        ctx.beginPath();
        ctx.moveTo(cx - dynamicWidth/2, cy + y);
        ctx.lineTo(cx + dynamicWidth/2, cy + y);
        ctx.strokeStyle = 'rgba(255, 75, 75, 0.5)';
        ctx.stroke();
      }

      // 5. Center Red Dots along a wave
      const dotCount = 30;
      for (let i = 0; i < dotCount; i++) {
        const xPos = (i / dotCount) * hatchWidth - hatchWidth/2;
        const waveY = Math.sin(xPos * 0.02 + t * 4) * 40 * Math.cos(xPos * 0.015) * Math.sin(t*1.5);
        
        ctx.beginPath();
        ctx.arc(cx + xPos, cy + waveY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FF4B4B';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF4B4B';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      for(let i=-2; i<=2; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy + i*40, 3, 0, Math.PI*2);
        ctx.fillStyle = '#FF4B4B';
        ctx.fill();
      }

      requestAnimationFrame(drawHero);
    }
    drawHero();
  }

  // ── Demo Grid ──
  const demoGrid = document.getElementById('demo-grid');
  if (demoGrid) {
    const gridSize = 10;
    const totalDots = gridSize * gridSize;
    const demoFragment = document.createDocumentFragment();
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement('div');
      dot.className = 'demo-dot';
      demoFragment.appendChild(dot);
    }
    demoGrid.appendChild(demoFragment);
  }

  const animationCodes = {
    wave: `anime({
  targets: '.demo-dot',
  scale: [0.3, 1],
  opacity: [0.1, 1],
  delay: anime.stagger(100, {
    grid: [10, 10],
    from: 'center'
  }),
  easing: 'easeOutElastic(1, .5)',
  duration: 1500,
  loop: true,
  direction: 'alternate'
});`,
    spiral: `anime({
  targets: '.demo-dot',
  rotate: [0, 360],
  scale: [0, 1],
  opacity: [0, 1],
  delay: anime.stagger(30, {
    from: 'first'
  }),
  easing: 'easeInOutQuad',
  duration: 1200,
  loop: true,
  direction: 'alternate'
});`,
    explosion: `anime({
  targets: '.demo-dot',
  translateX: () => anime.random(-200, 200),
  translateY: () => anime.random(-200, 200),
  scale: [1, 0],
  opacity: [1, 0],
  easing: 'easeOutExpo',
  duration: 1500,
  loop: true
});`,
    heartbeat: `anime({
  targets: '.demo-dot',
  scale: [1, 1.4, 1],
  opacity: [0.3, 1, 0.3],
  delay: anime.stagger(80, {
    grid: [10, 10],
    from: 'center'
  }),
  easing: 'easeInOutSine',
  duration: 1600,
  loop: true
});`,
    matrix: `anime({
  targets: '.demo-dot',
  translateY: ['-100%', '100%'],
  opacity: [0, 1, 0],
  delay: anime.stagger(40, {
    from: 'random'
  }),
  easing: 'linear',
  duration: 2000,
  loop: true
});`
  };

  let currentAnim = null;
  function playDemo(type) {
    if (typeof anime === 'undefined') return;
    if (currentAnim) currentAnim.pause();
    
    // Reset state
    anime.set('.demo-dot', {
      translateX: 0,
      translateY: 0,
      scale: 1,
      rotate: 0,
      opacity: 1,
      backgroundColor: '#FF4B4B'
    });

    switch (type) {
      case 'wave':
        currentAnim = anime({
          targets: '.demo-dot',
          scale: [0.3, 1],
          opacity: [0.1, 1],
          delay: anime.stagger(100, { grid: [10, 10], from: 'center' }),
          backgroundColor: ['#FF4B4B', '#5A87FF'],
          easing: 'easeOutElastic(1, .5)',
          duration: 1500,
          loop: true,
          direction: 'alternate'
        });
        break;
      case 'spiral':
        currentAnim = anime({
          targets: '.demo-dot',
          rotate: [0, 360],
          scale: [0, 1],
          opacity: [0, 1],
          delay: anime.stagger(30, { from: 'first' }),
          backgroundColor: ['#18FF92', '#F6C153'],
          easing: 'easeInOutQuad',
          duration: 1200,
          loop: true,
          direction: 'alternate'
        });
        break;
      case 'explosion':
        currentAnim = anime({
          targets: '.demo-dot',
          translateX: () => anime.random(-200, 200),
          translateY: () => anime.random(-200, 200),
          scale: [1, 0],
          opacity: [1, 0],
          backgroundColor: '#C87BFF',
          easing: 'easeOutExpo',
          duration: 1500,
          loop: true
        });
        break;
      case 'heartbeat':
        currentAnim = anime({
          targets: '.demo-dot',
          scale: [1, 1.4, 1],
          opacity: [0.3, 1, 0.3],
          delay: anime.stagger(80, { grid: [10, 10], from: 'center' }),
          backgroundColor: '#FF4B4B',
          easing: 'easeInOutSine',
          duration: 1600,
          loop: true
        });
        break;
      case 'matrix':
        currentAnim = anime({
          targets: '.demo-dot',
          translateY: ['-100%', '100%'],
          opacity: [0, 1, 0],
          delay: anime.stagger(40, { from: 'random' }),
          backgroundColor: '#18FF92',
          easing: 'linear',
          duration: 2000,
          loop: true
        });
        break;
    }
  }

  // Demo buttons
  const demoBtns = document.querySelectorAll('.demo-btn');
  const codeContent = document.getElementById('code-content');
  demoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      demoBtns.forEach(b => b.classList.remove('demo-btn--active'));
      btn.classList.add('demo-btn--active');
      const type = btn.dataset.animation;
      codeContent.textContent = animationCodes[type];
      playDemo(type);
    });
  });
  playDemo('wave');

  // ── Scroll Animations ──
  const scrollCards = document.querySelectorAll('.scroll-animate');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.classList.contains('animated')) {
        e.target.classList.add('animated');
        if (typeof anime !== 'undefined') {
          anime({
            targets: e.target,
            translateX: [e.target.dataset.direction === 'left' ? -60 : 60, 0],
            opacity: [0, 1],
            duration: 1000,
            easing: 'easeOutCubic'
          });
        } else {
          e.target.style.opacity = 1;
          e.target.style.transform = 'translateX(0)';
        }
      }
    });
  }, { threshold: 0.2 });
  scrollCards.forEach(card => observer.observe(card));

  // ── Particle Field ──
  const pf = document.getElementById('particle-field');
  if (pf) {
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = 3 + Math.random() * 8;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = (Math.random() * 4) + 's';
      p.style.animationDuration = (3 + Math.random() * 3) + 's';
      pf.appendChild(p);
    }
  }

  // ── Scroll Gauge ──
  const gaugeProgress = document.getElementById('gauge-progress');
  const gaugeValue = document.getElementById('gauge-value');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(1, scrollTop / docHeight);
    const circumference = 534;
    if (gaugeProgress) {
      gaugeProgress.style.strokeDashoffset = circumference - (progress * circumference);
    }
    if (gaugeValue) {
      gaugeValue.textContent = Math.round(progress * 100);
    }
  });

  // ── API Size Bars Animation ──
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fills = e.target.querySelectorAll('.api-size-bar-fill');
        fills.forEach(fill => {
          fill.style.width = fill.dataset.width + '%';
        });
        barObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  const sizeCard = document.querySelector('.api-card--size');
  if (sizeCard) barObserver.observe(sizeCard);

  // ── Counter Animation ──
  const statObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const numEl = e.target.querySelector('.api-stat-number');
        const target = +numEl.dataset.target;
        let current = 0;
        const step = Math.ceil(target / 40);
        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(interval);
          }
          numEl.textContent = current;
        }, 30);
        statObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.api-stat').forEach(stat => statObserver.observe(stat));

  // ── Navbar Scroll Effect ──
  const navbar = document.getElementById('main-nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 80) {
      navbar.style.boxShadow = '0 4px 30px rgba(0,0,0,.2)';
    } else {
      navbar.style.boxShadow = 'none';
    }
    lastScroll = scrollY;
  });

  // ── Newsletter ──
  const nlBtn = document.getElementById('newsletter-btn');
  const nlInput = document.getElementById('newsletter-email');
  if (nlBtn && nlInput) {
    nlBtn.addEventListener('click', () => {
      if (nlInput.value.includes('@')) {
        nlInput.value = '';
        nlInput.placeholder = 'Thanks! ✓';
        setTimeout(() => { nlInput.placeholder = 'your@email.com'; }, 2000);
      }
    });
  }

});
