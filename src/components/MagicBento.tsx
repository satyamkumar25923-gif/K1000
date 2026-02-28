import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface MagicBentoProps {
    children: React.ReactNode;
    className?: string;
    textAutoHide?: boolean;
    enableStars?: boolean;
    enableSpotlight?: boolean;
    enableBorderGlow?: boolean;
    enableTilt?: boolean;
    enableMagnetism?: boolean;
    clickEffect?: boolean;
    spotlightRadius?: number;
    particleCount?: number;
    glowColor?: string; // Format: "132, 0, 255"
    disableAnimations?: boolean;
}

const MagicBento: React.FC<MagicBentoProps> = ({
    children,
    className = "",
    textAutoHide = true,
    enableStars = true,
    enableSpotlight = true,
    enableBorderGlow = true,
    enableTilt = false,
    enableMagnetism = false,
    clickEffect = true,
    spotlightRadius = 400,
    particleCount = 12,
    glowColor = "245, 158, 11", // Gold/Amber to match site
    disableAnimations = false
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const starsRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (disableAnimations || !containerRef.current) return;

        const container = containerRef.current;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (enableSpotlight && spotlightRef.current) {
                gsap.to(spotlightRef.current, {
                    x: x - spotlightRadius / 2,
                    y: y - spotlightRadius / 2,
                    duration: 0.2,
                    ease: "power2.out"
                });
            }

            if (enableTilt) {
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;

                gsap.to(container, {
                    rotateX,
                    rotateY,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        };

        const handleMouseEnter = () => setIsHovered(true);
        const handleMouseLeave = () => {
            setIsHovered(false);
            if (enableTilt) {
                gsap.to(container, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.5,
                    ease: "power2.out"
                });
            }
        };

        const handleClick = (e: MouseEvent) => {
            if (!clickEffect) return;

            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('div');
            ripple.className = 'absolute rounded-full pointer-events-none';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.width = '0px';
            ripple.style.height = '0px';
            ripple.style.backgroundColor = `rgba(${glowColor}, 0.2)`;
            ripple.style.boxShadow = `0 0 20px rgba(${glowColor}, 0.5)`;
            container.appendChild(ripple);

            gsap.to(ripple, {
                width: rect.width * 2.5,
                height: rect.width * 2.5,
                x: -rect.width * 1.25,
                y: -rect.width * 1.25,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => ripple.remove()
            });
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);
        container.addEventListener('click', handleClick);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
            container.removeEventListener('click', handleClick);
        };
    }, [disableAnimations, enableSpotlight, enableTilt, spotlightRadius, clickEffect, glowColor]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden group transition-all duration-300 ${className}`}
            style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Border Glow */}
            {enableBorderGlow && (
                <div
                    className="absolute inset-0 rounded-[inherit] pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        border: `1px solid rgba(${glowColor}, 0.4)`,
                        boxShadow: `inset 0 0 15px rgba(${glowColor}, 0.2), 0 0 15px rgba(${glowColor}, 0.2)`
                    }}
                />
            )}

            {/* Spotlight Effect */}
            {enableSpotlight && (
                <div
                    ref={spotlightRef}
                    className="absolute pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"
                    style={{
                        width: `${spotlightRadius}px`,
                        height: `${spotlightRadius}px`,
                        background: `radial-gradient(circle, rgba(${glowColor}, 0.15) 0%, rgba(${glowColor}, 0) 70%)`,
                        filter: 'blur(30px)'
                    }}
                />
            )}

            {/* Stars/Particles Effect */}
            {enableStars && (
                <div className="absolute inset-0 pointer-events-none z-20">
                    {[...Array(particleCount)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                backgroundColor: i % 2 === 0 ? `rgb(${glowColor})` : '#fff',
                                boxShadow: `0 0 5px ${i % 2 === 0 ? `rgb(${glowColor})` : '#fff'}`,
                                animation: `magic-star ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Content */}
            <div className={`relative z-40 h-full w-full ${textAutoHide ? 'group-hover:translate-y-[-2px] transition-transform duration-300' : ''}`}>
                {children}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes magic-star {
          0%, 100% { opacity: 0; transform: scale(0) translateY(0); }
          50% { opacity: 0.8; transform: scale(1) translateY(-10px); }
        }
      `}} />
        </div>
    );
};

export default MagicBento;
