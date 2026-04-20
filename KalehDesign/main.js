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

  // ── Hero Canvas Animation (Circular Gear) ──
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, heroFrame;
  const colors = ['#FF324A','#FF8C42','#FFBD39','#27E07D','#3777FF','#0EEBC2','#A855F7'];

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
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
    t += 0.008;
    ctx.clearRect(0, 0, W, H);
    const r = Math.min(W, H) * 0.4;

    // Outer colored ring arcs
    const arcColors = ['#FF324A','#27E07D','#FFBD39','#3777FF','#0EEBC2','#A855F7'];
    const arcCount = arcColors.length;
    const gap = 0.08;
    const arcLen = (Math.PI * 2 / arcCount) - gap;
    ctx.lineWidth = 3;
    arcColors.forEach((c, i) => {
      const start = (i * (Math.PI * 2 / arcCount)) + t;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + arcLen);
      ctx.strokeStyle = c;
      ctx.stroke();
    });

    // Inner tick marks
    ctx.lineWidth = 1;
    const tickCount = 72;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2 + t * 1.5;
      const innerR = r * 0.82;
      const outerR = r * 0.92;
      const pulse = 0.5 + 0.5 * Math.sin(t * 4 + i * 0.3);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.strokeStyle = `rgba(255,50,74,${0.15 + pulse * 0.35})`;
      ctx.stroke();
    }

    // Center rotating diamond / rhombus with hatching
    const diamondSize = r * 0.5;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.5);

    // Diamond outline
    ctx.beginPath();
    ctx.moveTo(0, -diamondSize);
    ctx.lineTo(diamondSize, 0);
    ctx.lineTo(0, diamondSize);
    ctx.lineTo(-diamondSize, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,50,74,0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,50,74,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hatching lines inside diamond
    ctx.clip();
    const lineCount = 30;
    for (let i = -lineCount; i <= lineCount; i++) {
      const y = (i / lineCount) * diamondSize * 1.5;
      ctx.beginPath();
      ctx.moveTo(-diamondSize, y);
      ctx.lineTo(diamondSize, y);
      ctx.strokeStyle = `rgba(255,50,74,${0.12 + 0.08 * Math.sin(t * 3 + i * 0.5)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // Orbiting dots
    const dotCount = 20;
    for (let i = 0; i < dotCount; i++) {
      const angle = (i / dotCount) * Math.PI * 2 + t * 2;
      const dotR = r * (0.35 + 0.2 * Math.sin(t * 1.5 + i));
      const x = cx + Math.cos(angle) * dotR;
      const y = cy + Math.sin(angle) * dotR;
      const pulse = 0.5 + 0.5 * Math.sin(t * 5 + i * 0.8);
      ctx.beginPath();
      ctx.arc(x, y, 2.5 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.4 + pulse * 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Semi-transparent arc segments
    ctx.lineWidth = 8;
    for (let i = 0; i < 3; i++) {
      const aR = r * (0.55 + i * 0.1);
      const start = t * (1 + i * 0.3) + i * 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, aR, start, start + 0.8);
      ctx.strokeStyle = `rgba(${i === 0 ? '255,50,74' : i === 1 ? '39,224,125' : '55,119,255'},0.12)`;
      ctx.stroke();
    }

    heroFrame = requestAnimationFrame(drawHero);
  }
  drawHero();

  // ── Demo Grid ──
  const demoGrid = document.getElementById('demo-grid');
  const gridSize = 10;
  const totalDots = gridSize * gridSize;
  for (let i = 0; i < totalDots; i++) {
    const dot = document.createElement('div');
    dot.className = 'demo-dot';
    dot.dataset.row = Math.floor(i / gridSize);
    dot.dataset.col = i % gridSize;
    demoGrid.appendChild(dot);
  }
  const dots = demoGrid.querySelectorAll('.demo-dot');

  const animationCodes = {
    wave: `kaleh.animate({
  targets: '.grid-item',
  scale: [0.5, 1],
  opacity: [0, 1],
  delay: kaleh.stagger(50, {
    grid: [10, 10],
    from: 'center'
  }),
  easing: 'easeOutElastic(1, .5)',
  duration: 1500
});`,
    spiral: `kaleh.animate({
  targets: '.grid-item',
  rotate: [0, 360],
  scale: [0, 1],
  delay: kaleh.stagger(30, {
    from: 'first',
    direction: 'normal'
  }),
  easing: 'easeInOutQuad',
  duration: 1200
});`,
    explosion: `kaleh.animate({
  targets: '.grid-item',
  translateX: () => kaleh.random(-200, 200),
  translateY: () => kaleh.random(-200, 200),
  scale: [1, 0],
  opacity: [1, 0],
  easing: 'easeOutExpo',
  duration: 1000
});`,
    heartbeat: `kaleh.animate({
  targets: '.grid-item',
  scale: [1, 1.4, 1],
  opacity: [0.3, 1, 0.3],
  delay: kaleh.stagger(80, {
    grid: [10, 10],
    from: 'center'
  }),
  easing: 'easeInOutSine',
  duration: 1600,
  loop: true
});`,
    matrix: `kaleh.animate({
  targets: '.grid-item',
  translateY: ['-100%', '100%'],
  opacity: [0, 1, 0],
  delay: kaleh.stagger(40, {
    from: 'random'
  }),
  easing: 'linear',
  duration: 2000,
  loop: true
});`
  };

  let currentAnim = null;
  function animateDots(type) {
    if (currentAnim) cancelAnimationFrame(currentAnim);
    const startTime = performance.now();
    const center = { r: 4.5, c: 4.5 };

    function tick(now) {
      const elapsed = (now - startTime) / 1000;
      dots.forEach(dot => {
        const r = +dot.dataset.row;
        const c = +dot.dataset.col;
        const distCenter = Math.sqrt((r - center.r) ** 2 + (c - center.c) ** 2);
        const distCorner = Math.sqrt(r ** 2 + c ** 2);
        let scale = 1, opacity = 1, tx = 0, ty = 0, rot = 0;
        let color = 'var(--accent-red)';

        switch (type) {
          case 'wave': {
            const delay = distCenter * 0.08;
            const t = Math.max(0, elapsed - delay);
            const ease = 1 - Math.pow(Math.max(0, 1 - t * 1.5), 3);
            scale = 0.3 + 0.7 * ease;
            opacity = 0.1 + 0.9 * ease;
            const hue = (distCenter * 30 + elapsed * 60) % 360;
            color = `hsl(${hue}, 80%, 60%)`;
            break;
          }
          case 'spiral': {
            const angle = Math.atan2(r - center.r, c - center.c);
            const delay = (angle + Math.PI) / (Math.PI * 2) * 0.8 + distCenter * 0.04;
            const t = Math.max(0, elapsed - delay);
            rot = t * 360;
            scale = Math.min(1, t * 2);
            opacity = Math.min(1, t * 2);
            color = `hsl(${(angle * 180 / Math.PI + 180 + elapsed * 40) % 360}, 80%, 60%)`;
            break;
          }
          case 'explosion': {
            const t = (elapsed * 0.5) % 2;
            if (t < 1) {
              const ease = 1 - Math.pow(1 - t, 3);
              const dir = Math.atan2(r - center.r, c - center.c);
              tx = Math.cos(dir) * distCenter * 8 * ease;
              ty = Math.sin(dir) * distCenter * 8 * ease;
              scale = 1 - ease * 0.6;
              opacity = 1 - ease;
            } else {
              const ease = 1 - Math.pow(1 - (t - 1), 3);
              scale = ease;
              opacity = ease;
              tx = 0; ty = 0;
            }
            color = `hsl(${distCenter * 20 + 350}, 85%, 55%)`;
            break;
          }
          case 'heartbeat': {
            const delay = distCenter * 0.1;
            const t = ((elapsed - delay) * 1.2) % 2;
            const beat = t < 1 ? Math.sin(t * Math.PI) : 0;
            scale = 0.5 + beat * 0.8;
            opacity = 0.2 + beat * 0.8;
            color = `hsl(${340 + beat * 30}, 85%, ${50 + beat * 20}%)`;
            break;
          }
          case 'matrix': {
            const seed = (r * 13 + c * 37) % 17;
            const speed = 0.5 + (seed / 17) * 1.5;
            const phase = ((elapsed * speed + seed * 0.3) % 2);
            ty = (phase - 1) * 40;
            opacity = phase < 1 ? phase : 2 - phase;
            scale = 0.6 + opacity * 0.4;
            color = `hsl(${140 + c * 5}, 80%, ${40 + opacity * 30}%)`;
            break;
          }
        }
        dot.style.transform = `translate(${tx}px, ${ty}px) scale(${scale}) rotate(${rot}deg)`;
        dot.style.opacity = opacity;
        dot.style.background = color;
      });
      currentAnim = requestAnimationFrame(tick);
    }
    currentAnim = requestAnimationFrame(tick);
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
      animateDots(type);
    });
  });
  animateDots('wave');

  // ── Scroll Animations ──
  const scrollCards = document.querySelectorAll('.scroll-animate');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
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
