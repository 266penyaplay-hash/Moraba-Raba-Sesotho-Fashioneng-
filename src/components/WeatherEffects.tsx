import React, { useEffect, useRef } from 'react';
import { LesothoAtmosphere } from './LesothoBackdrop';

interface WeatherEffectsProps {
  atmosphere: LesothoAtmosphere;
  intensity?: number;
  lightningEnabled?: boolean;
}

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  opacity: number;
  sway: number;
  swaySpeed: number;
}

interface Raindrop {
  x: number;
  y: number;
  length: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

interface MistParticle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
  growth: number;
}

interface DustMote {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseOpacity: number;
  pulseSpeed: number;
}

interface Ember {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  life: number;
  maxLife: number;
  color: string;
}

export const WeatherEffects: React.FC<WeatherEffectsProps> = ({
  atmosphere,
  intensity = 1,
  lightningEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightningFlash, setLightningFlash] = React.useState<number>(0);
  const [lightningBolt, setLightningBolt] = React.useState<{ x1: number; y1: number; path: string } | null>(null);

  // Lightning system for thunderstorm atmosphere (Sefako - Mokhotlong Storm)
  useEffect(() => {
    if ((atmosphere !== 'mokhotlong-storm' && atmosphere !== 'highland-storm') || !lightningEnabled) {
      setLightningFlash(0);
      setLightningBolt(null);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const triggerLightning = () => {
      const startX = 200 + Math.random() * (window.innerWidth - 400);
      const startY = 0;
      let curX = startX;
      let curY = startY;
      const points: string[] = [`M ${curX} ${curY}`];

      const targetY = window.innerHeight * 0.55;
      while (curY < targetY) {
        curY += 20 + Math.random() * 35;
        curX += (Math.random() - 0.48) * 45;
        points.push(`L ${curX.toFixed(1)} ${curY.toFixed(1)}`);
      }

      setLightningBolt({
        x1: startX,
        y1: startY,
        path: points.join(' '),
      });

      // Triple-strobe flash
      setLightningFlash(0.95);
      setTimeout(() => setLightningFlash(0.3), 60);
      setTimeout(() => setLightningFlash(0.85), 120);
      setTimeout(() => setLightningFlash(0.15), 220);
      setTimeout(() => {
        setLightningFlash(0);
        setLightningBolt(null);
      }, 340);

      // Next lightning strike in 4.5 to 10 seconds
      const nextDelay = 4500 + Math.random() * 5500;
      timeoutId = setTimeout(triggerLightning, nextDelay);
    };

    const initialDelay = 1200 + Math.random() * 2500;
    timeoutId = setTimeout(triggerLightning, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [atmosphere, lightningEnabled]);

  // Main Canvas Particle Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize snow particles
    const snowflakes: Snowflake[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2.8,
      speedY: 0.6 + Math.random() * 1.4,
      speedX: -0.3 + Math.random() * 0.6,
      opacity: 0.35 + Math.random() * 0.65,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.015 + Math.random() * 0.03,
    }));

    // Initialize rain particles
    const raindrops: Raindrop[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 12 + Math.random() * 18,
      speedY: 9 + Math.random() * 8,
      speedX: -2.5 - Math.random() * 2,
      opacity: 0.25 + Math.random() * 0.55,
    }));

    // Initialize mist fog particles (Litšepe - Leribe)
    const mistParticles: MistParticle[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: height * 0.2 + Math.random() * (height * 0.6),
      radius: 40 + Math.random() * 80,
      speedX: 0.2 + Math.random() * 0.4,
      speedY: -0.05 + Math.random() * 0.1,
      opacity: 0.04 + Math.random() * 0.08,
      growth: 0.01 + Math.random() * 0.02,
    }));

    // Initialize dust motes (Matenase - Golden Dawn)
    const dustMotes: DustMote[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2.5,
      speedX: 0.15 + Math.random() * 0.35,
      speedY: -0.1 - Math.random() * 0.25,
      opacity: 0.3,
      baseOpacity: 0.25 + Math.random() * 0.6,
      pulseSpeed: 0.02 + Math.random() * 0.04,
    }));

    // Initialize embers (Bothata - Khubetsoana Red & Morena - Tsoenene)
    const embers: Ember[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: height * 0.5 + Math.random() * (height * 0.5),
      size: 1.2 + Math.random() * 2.6,
      speedX: (Math.random() - 0.45) * 1.2,
      speedY: -0.6 - Math.random() * 1.5,
      opacity: 0.4 + Math.random() * 0.6,
      life: Math.random() * 100,
      maxLife: 80 + Math.random() * 90,
      color:
        atmosphere === 'tsoenene'
          ? Math.random() > 0.35
            ? '#FF7A29'
            : '#FFD700'
          : Math.random() > 0.4
          ? '#E06D38'
          : '#FFAD5A',
    }));

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const isSnow = atmosphere === 'winter-snow';
      const isMist = atmosphere === 'highland-mist';
      const isRain = atmosphere === 'mokhotlong-storm' || atmosphere === 'highland-storm';
      const isDawn = atmosphere === 'golden-dawn';
      const isSunset = atmosphere === 'khubetsoana-red';
      const isMidnight = atmosphere === 'tsoenene';

      // 1. Snowflakes rendering (Winter Frost)
      if (isSnow) {
        ctx.fillStyle = '#FFFFFF';
        snowflakes.forEach((flake) => {
          flake.sway += flake.swaySpeed;
          flake.y += flake.speedY * intensity;
          flake.x += (flake.speedX + Math.sin(flake.sway) * 0.6) * intensity;

          if (flake.y > height) {
            flake.y = -5;
            flake.x = Math.random() * width;
          }
          if (flake.x > width) flake.x = 0;
          if (flake.x < 0) flake.x = width;

          ctx.beginPath();
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity * 0.85})`;
          ctx.fill();
        });
      }

      // 2. Mist & Mountain Fog rendering (Litšepe - Leribe)
      if (isMist) {
        mistParticles.forEach((mist) => {
          mist.x += mist.speedX * intensity;
          mist.y += mist.speedY * intensity;
          mist.radius += mist.growth;

          if (mist.x - mist.radius > width) {
            mist.x = -mist.radius;
            mist.y = height * 0.2 + Math.random() * (height * 0.6);
            mist.radius = 40 + Math.random() * 60;
          }

          const grad = ctx.createRadialGradient(
            mist.x,
            mist.y,
            0,
            mist.x,
            mist.y,
            mist.radius
          );
          grad.addColorStop(0, `rgba(180, 215, 245, ${mist.opacity})`);
          grad.addColorStop(0.6, `rgba(140, 185, 220, ${mist.opacity * 0.5})`);
          grad.addColorStop(1, 'rgba(140, 185, 220, 0)');

          ctx.beginPath();
          ctx.arc(mist.x, mist.y, mist.radius, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      }

      // 3. Rain streaks rendering (Sefako - Mokhotlong Storm)
      if (isRain) {
        ctx.lineWidth = 1.3;
        raindrops.forEach((drop) => {
          drop.y += drop.speedY * intensity;
          drop.x += drop.speedX * intensity;

          if (drop.y > height) {
            drop.y = -20;
            drop.x = Math.random() * (width + 100);
          }

          ctx.strokeStyle = `rgba(215, 235, 255, ${drop.opacity * 0.75})`;
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + drop.speedX * 1.5, drop.y + drop.length);
          ctx.stroke();
        });
      }

      // 4. Golden Dust Motes (Matenase - Golden Dawn)
      if (isDawn) {
        dustMotes.forEach((mote) => {
          mote.x += mote.speedX * intensity;
          mote.y += mote.speedY * intensity;
          const currentOpacity =
            mote.baseOpacity * (0.6 + 0.4 * Math.sin(tick * mote.pulseSpeed));

          if (mote.y < 0) {
            mote.y = height;
            mote.x = Math.random() * width;
          }
          if (mote.x > width) mote.x = 0;

          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 230, 160, ${currentOpacity * 0.75})`;
          ctx.fill();
        });
      }

      // 5. Dusk / Campfire Embers (Bothata & Morena Letsie)
      if (isSunset || isMidnight) {
        embers.forEach((ember) => {
          ember.life++;
          ember.y += ember.speedY * intensity;
          ember.x += ember.speedX * intensity;

          if (ember.life > ember.maxLife || ember.y < 0) {
            ember.life = 0;
            ember.y = height * 0.75 + Math.random() * (height * 0.25);
            ember.x = Math.random() * width;
          }

          const progress = ember.life / ember.maxLife;
          const alpha = (1 - progress) * ember.opacity;

          ctx.beginPath();
          ctx.arc(ember.x, ember.y, ember.size * (1 - progress * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = ember.color;
          ctx.globalAlpha = alpha;
          ctx.shadowBlur = 5;
          ctx.shadowColor = ember.color;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [atmosphere, intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden select-none">
      {/* Dynamic Ambient Screen Flash for Lightning (Natural atmospheric luminescence) */}
      {lightningFlash > 0 && (
        <div
          className="absolute inset-0 bg-[#D4E8FF] transition-opacity duration-75 mix-blend-screen pointer-events-none z-[3]"
          style={{ opacity: lightningFlash * 0.7 }}
        />
      )}

      {/* Canvas for Particle Rendering (Rain, Snow, Mountain Mist, Dust Motes, Campfire Embers) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
};
