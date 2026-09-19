import { useEffect, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseSize: number;
  alpha: number;
  maxLife: number;
  life: number;
  colorType: number; // 0: white-gold, 1: yellow-orange, 2: vibrant-orange, 3: ember-red
  seed: number;
  corner: number; // 0: BL, 1: BR, 2: TL, 3: TR, 4: ambient
}

export default function FireSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Track scroll velocity for thermal updraft
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    const onScroll = () => {
      const currentY = window.scrollY;
      scrollVel = (currentY - lastScrollY) * 0.15;
      lastScrollY = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Ember count based on screen size (60 on mobile, 140 on desktop)
    const count = Math.min(140, Math.max(60, Math.floor((width * height) / 14000)));
    const sparks: Spark[] = [];

    function createSpark(init = false): Spark {
      // 70% corner concentration, 30% ambient screen
      const isCorner = Math.random() < 0.72;
      let corner = 4;
      let x = 0;
      let y = 0;
      let vx = 0;
      let vy = 0;

      if (isCorner) {
        // Pick one of 4 corners (weighted toward bottom corners 75%)
        const cornerRoll = Math.random();
        if (cornerRoll < 0.40) {
          // Bottom-Left (shoots upward and toward center/right)
          corner = 0;
          x = Math.random() * (width * 0.22);
          y = height - Math.random() * (height * 0.25);
          vx = 0.5 + Math.random() * 2.2;
          vy = -(1.2 + Math.random() * 3.0);
        } else if (cornerRoll < 0.80) {
          // Bottom-Right (shoots upward and toward center/left)
          corner = 1;
          x = width - Math.random() * (width * 0.22);
          y = height - Math.random() * (height * 0.25);
          vx = -(0.5 + Math.random() * 2.2);
          vy = -(1.2 + Math.random() * 3.0);
        } else if (cornerRoll < 0.90) {
          // Top-Left (drifts down & inward)
          corner = 2;
          x = Math.random() * (width * 0.18);
          y = Math.random() * (height * 0.20);
          vx = 0.4 + Math.random() * 1.8;
          vy = 0.3 + Math.random() * 1.4;
        } else {
          // Top-Right (drifts down & inward)
          corner = 3;
          x = width - Math.random() * (width * 0.18);
          y = Math.random() * (height * 0.20);
          vx = -(0.4 + Math.random() * 1.8);
          vy = 0.3 + Math.random() * 1.4;
        }
      } else {
        // Ambient spark anywhere on screen
        corner = 4;
        x = Math.random() * width;
        y = init ? Math.random() * height : height + Math.random() * 40;
        vx = (Math.random() - 0.5) * 1.6;
        vy = -(0.8 + Math.random() * 2.2);
      }

      const baseSize = 1.0 + Math.random() * 2.8;
      const maxLife = 80 + Math.random() * 160;
      const life = init ? Math.random() * maxLife : 0;

      // Color variation
      const colorRoll = Math.random();
      const colorType = colorRoll < 0.25 ? 0 : colorRoll < 0.60 ? 1 : colorRoll < 0.85 ? 2 : 3;

      return {
        x,
        y,
        vx,
        vy,
        size: baseSize,
        baseSize,
        alpha: 0,
        maxLife,
        life,
        colorType,
        seed: Math.random() * 100,
        corner,
      };
    }

    // Populate initial sparks
    for (let i = 0; i < count; i++) {
      sparks.push(createSpark(true));
    }

    let time = 0;

    function render() {
      if (!ctx) return;
      time += 0.02;
      scrollVel *= 0.92; // Decay scroll velocity
      ctx.clearRect(0, 0, width, height);

      // Additive fire blending for incandescent glow
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < sparks.length; i++) {
        const s = sparks[i];
        s.life++;

        if (s.life >= s.maxLife || s.x < -40 || s.x > width + 40 || s.y < -40 || s.y > height + 40) {
          sparks[i] = createSpark(false);
          continue;
        }

        // Progress 0 -> 1
        const p = s.life / s.maxLife;

        // Smooth opacity curve: fade in quickly, stay luminous, fade out smoothly
        if (p < 0.15) {
          s.alpha = (p / 0.15) * 0.9;
        } else if (p > 0.70) {
          s.alpha = ((1 - p) / 0.30) * 0.9;
        } else {
          s.alpha = 0.7 + Math.sin(time * 6 + s.seed) * 0.2;
        }

        // Slight size pulsing as ember burns
        s.size = s.baseSize * (1 - p * 0.35 + Math.sin(time * 8 + s.seed) * 0.15);

        // Movement with organic air turbulence & scroll updraft
        const sway = Math.sin(time * 2.5 + s.seed) * 0.6;
        s.x += s.vx + sway;
        s.y += s.vy - Math.abs(scrollVel) * 0.4;

        // Draw glowing ember
        ctx.beginPath();
        ctx.arc(s.x, s.y, Math.max(0.5, s.size), 0, Math.PI * 2);

        let r = 255, g = 170, b = 40;
        if (s.colorType === 0) {
          // White-hot core
          r = 255; g = 240; b = 180;
        } else if (s.colorType === 1) {
          // Bright gold/amber
          r = 255; g = 190; b = 35;
        } else if (s.colorType === 2) {
          // Fiery orange
          r = 255; g = 110; b = 15;
        } else {
          // Deep ember red
          r = 235; g = 45; b = 10;
        }

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, s.alpha))})`;
        ctx.fill();

        // Outer soft glow halo for larger embers
        if (s.size > 2.0) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${Math.floor(g * 0.7)}, 0, ${s.alpha * 0.25})`;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fire-sparks-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 120, // Floats above image panels and story layers, beneath HUD UI
      }}
    />
  );
}
