function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");

  if (!menu || !icon) return;

  menu.classList.toggle("open");
  icon.classList.toggle("open");
  icon.setAttribute("aria-expanded", icon.classList.contains("open"));
}

const copyEmailButton = document.querySelector("[data-copy-email]");
const email = "abdullaharshed956@gmail.com";

copyEmailButton?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(email);
    copyEmailButton.textContent = "Email Copied";
    window.setTimeout(() => {
      copyEmailButton.textContent = "Copy Email";
    }, 1600);
  } catch {
    window.location.href = `mailto:${email}`;
  }
});

const inkCanvas = document.querySelector("#ink-canvas");

if (inkCanvas) {
  const ctx = inkCanvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const maxParticles = 150;
  const targetFrameMs = 1000 / 30;
  const particles = [];
  const pointer = {
    x: window.innerWidth * 0.62,
    y: window.innerHeight * 0.34,
    lastX: window.innerWidth * 0.62,
    lastY: window.innerHeight * 0.34,
  };

  const inkPalette = [
    { r: 31, g: 125, b: 144 },
    { r: 111, g: 94, b: 211 },
    { r: 216, g: 112, b: 83 },
    { r: 57, g: 148, b: 99 },
    { r: 196, g: 84, b: 132 },
    { r: 178, g: 135, b: 55 },
  ];

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let animationFrame = null;
  let lastFrame = 0;
  let lastEmit = 0;
  let activeTone = inkPalette[0];

  function startInkLoop() {
    if (animationFrame || reduceMotion.matches || document.hidden) return;

    lastFrame = performance.now();
    animationFrame = window.requestAnimationFrame(renderInk);
  }

  function resizeInkCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    width = window.innerWidth;
    height = window.innerHeight;
    inkCanvas.width = Math.floor(width * pixelRatio);
    inkCanvas.height = Math.floor(height * pixelRatio);
    inkCanvas.style.width = `${width}px`;
    inkCanvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function tuneTone(tone) {
    const variance = 16;
    const shift = () => Math.round((Math.random() - 0.5) * variance);

    return {
      r: Math.max(0, Math.min(255, tone.r + shift())),
      g: Math.max(0, Math.min(255, tone.g + shift())),
      b: Math.max(0, Math.min(255, tone.b + shift())),
    };
  }

  function addInk(x, y, strength = 1, burst = false, tone = activeTone) {
    if (reduceMotion.matches) return;

    const count = burst ? 18 : Math.ceil(2 * strength);

    for (let i = 0; i < count; i += 1) {
      const tunedTone = tuneTone(tone);
      const angle = Math.random() * Math.PI * 2;
      const speed = (burst ? 0.72 : 0.22) + Math.random() * (burst ? 0.9 : 0.36);
      const life = burst ? 140 + Math.random() * 80 : 58 + Math.random() * 34;
      const size = (burst ? 24 : 7) + Math.random() * (burst ? 46 : 14);

      particles.push({
        x: x + (Math.random() - 0.5) * (burst ? 34 : 18),
        y: y + (Math.random() - 0.5) * (burst ? 34 : 18),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        drift: (Math.random() - 0.5) * (burst ? 0.32 : 0.18),
        size,
        life,
        maxLife: life,
        alpha: burst ? 0.15 + Math.random() * 0.08 : 0.08 + Math.random() * 0.04,
        tone: tunedTone,
      });
    }

    if (particles.length > maxParticles) {
      particles.splice(0, particles.length - maxParticles);
    }

    startInkLoop();
  }

  function drawParticle(particle) {
    const progress = 1 - particle.life / particle.maxLife;
    const alpha = Math.max(0, (1 - progress) * particle.alpha);
    const size = particle.size * (1 + progress * 1.8);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = `rgba(${particle.tone.r}, ${particle.tone.g}, ${particle.tone.b}, 1)`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = alpha * 0.38;
    ctx.beginPath();
    ctx.arc(particle.x + size * 0.3, particle.y - size * 0.18, size * 0.58, 0, Math.PI * 2);
    ctx.fill();
  }

  function renderInk(timestamp = 0) {
    if (timestamp - lastFrame < targetFrameMs) {
      animationFrame = window.requestAnimationFrame(renderInk);
      return;
    }

    lastFrame = timestamp;
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.986;
      particle.vy *= 0.986;
      particle.vy *= 0.996;
      particle.x += Math.sin(particle.life * 0.028) * particle.drift;
      particle.y += Math.cos(particle.life * 0.023) * particle.drift * 0.38;
      particle.life -= 1;

      if (particle.life <= 0) {
        particles.splice(i, 1);
      } else {
        drawParticle(particle);
      }
    }

    ctx.globalAlpha = 1;
    animationFrame = particles.length ? window.requestAnimationFrame(renderInk) : null;
  }

  function moveInk(event) {
    const now = performance.now();
    const x = event.clientX;
    const y = event.clientY;
    const distance = Math.hypot(x - pointer.lastX, y - pointer.lastY);

    pointer.x = x;
    pointer.y = y;

    if (distance > 18 && now - lastEmit > 42) {
      addInk(x, y, Math.min(distance / 34, 1.4), false, activeTone);
      pointer.lastX = x;
      pointer.lastY = y;
      lastEmit = now;
    }
  }

  function burstInk(event) {
    activeTone = inkPalette[Math.floor(Math.random() * inkPalette.length)];
    addInk(event.clientX, event.clientY, 2.4, true, activeTone);
  }

  resizeInkCanvas();
  window.addEventListener("resize", resizeInkCanvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    } else if (!document.hidden && !reduceMotion.matches && !animationFrame) {
      startInkLoop();
    }
  });
  window.addEventListener("pointermove", moveInk, { passive: true });
  window.addEventListener("pointerdown", burstInk, { passive: true });

  addInk(pointer.x, pointer.y, 2, true);

  reduceMotion.addEventListener("change", () => {
    particles.length = 0;
    if (reduceMotion.matches && animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
      ctx.clearRect(0, 0, width, height);
    } else if (!animationFrame) {
      startInkLoop();
    }
  });
}
