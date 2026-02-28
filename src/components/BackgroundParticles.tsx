import React, { useEffect, useRef } from 'react';

export default function BackgroundParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particlesArray: Particle[] = [];
        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.size = Math.random() * 2 + 0.1; // Small size
                this.speedX = (Math.random() - 0.5) * 0.3; // Very slow
                this.speedY = (Math.random() - 0.5) * 0.3; // Very slow
                this.opacity = Math.random() * 0.5 + 0.1; // Subtle opacity
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around logic
                if (this.x > canvas!.width) this.x = 0;
                else if (this.x < 0) this.x = canvas!.width;

                if (this.y > canvas!.height) this.y = 0;
                else if (this.y < 0) this.y = canvas!.height;
            }

            draw() {
                ctx!.fillStyle = `rgba(245, 158, 11, ${this.opacity})`; // gold-500 tint
                ctx!.beginPath();
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx!.fill();
            }
        }

        const init = () => {
            particlesArray = [];
            const numberOfParticles = (canvas.width * canvas.height) / 10000; // Density
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            aria-hidden="true"
        />
    );
}
