import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseOpacity: number;
  pulseSpeed: number;
  pulseAngle: number;
  color: string;
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 70;

    // Glowing colors (amber/gold tones to match the site)
    const colors = [
      'rgba(245, 158, 11, ', // amber-500
      'rgba(251, 191, 36, ', // amber-400
      'rgba(217, 119, 6, ',  // amber-600
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15, // Very slow movement
          vy: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 3 + 1.5,
          baseOpacity: Math.random() * 0.4 + 0.1,
          pulseSpeed: Math.random() * 0.02 + 0.005,
          pulseAngle: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const draw = () => {
      // Create a slight trail effect by not fully clearing the canvas
      // Increased from 0.2 to 0.5 to keep the background much closer to true black
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulseAngle += p.pulseSpeed;

        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Calculate pulsing opacity (reduced slightly for less glare)
        const currentOpacity = (p.baseOpacity * 0.7) + Math.sin(p.pulseAngle) * 0.15;
        const boundedOpacity = Math.max(0, Math.min(1, currentOpacity));

        // Draw glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${boundedOpacity})`;

        // Add glow effect using shadow (reduced from size * 5 to size * 2 for less overpowering glow)
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = `${p.color}${boundedOpacity})`;
        ctx.fill();

        // Draw slow fading connections between very close particles to add to the magic feel
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Reduced connection distance and opacity for a darker look
          if (dist < 90) {
            ctx.beginPath();
            ctx.strokeStyle = `${p.color}${0.03 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.shadowBlur = 0; // No shadow for lines
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-20 pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
