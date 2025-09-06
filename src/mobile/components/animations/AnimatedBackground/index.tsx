import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedBackgroundProps, ParticleProps } from '../animations.types';
import { PARTICLE_CONFIG, GRADIENT_COLORS } from '../../../constants/animations';

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  variant = 'particles',
  intensity = 'medium',
  colors = PARTICLE_CONFIG.colors,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<ParticleProps[]>([]);
  const animationFrameRef = useRef<number>();

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const particleCount = intensity === 'low' ? 25 : intensity === 'medium' ? 50 : 75;
    
    const newParticles: ParticleProps[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.5 + 0.3,
    }));

    setParticles(newParticles);
  }, [intensity, colors]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      setParticles(prevParticles => 
        prevParticles.map(particle => {
          let newX = particle.x + particle.vx;
          let newY = particle.y + particle.vy;

          // Bounce off edges
          if (newX < 0 || newX > canvas.width) particle.vx *= -1;
          if (newY < 0 || newY > canvas.height) particle.vy *= -1;

          newX = Math.max(0, Math.min(canvas.width, newX));
          newY = Math.max(0, Math.min(canvas.height, newY));

          // Draw particle
          ctx.beginPath();
          ctx.arc(newX, newY, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
          ctx.fill();

          return { ...particle, x: newX, y: newY };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles]);

  const renderVariant = () => {
    switch (variant) {
      case 'particles':
        return (
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full"
          />
        );

      case 'gradient':
        return (
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                `linear-gradient(45deg, ${GRADIENT_COLORS.primary[0]}20, ${GRADIENT_COLORS.primary[1]}20)`,
                `linear-gradient(135deg, ${GRADIENT_COLORS.secondary[0]}20, ${GRADIENT_COLORS.secondary[1]}20)`,
                `linear-gradient(225deg, ${GRADIENT_COLORS.accent[0]}20, ${GRADIENT_COLORS.accent[1]}20)`,
              ]
            }}
            transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse' }}
          />
        );

      case 'waves':
        return (
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -top-20 -left-20 w-96 h-96 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors[0]}30, transparent 70%)`
              }}
              animate={{
                x: [-100, 100, -100],
                y: [-50, 50, -50],
              }}
              transition={{ duration: 20, repeat: Infinity }}
            />
            <motion.div
              className="absolute top-1/2 -right-20 w-80 h-80 rounded-full"
              style={{
                background: `radial-gradient(circle, ${colors[1]}25, transparent 70%)`
              }}
              animate={{
                x: [100, -100, 100],
                y: [50, -50, 50],
              }}
              transition={{ duration: 15, repeat: Infinity }}
            />
          </div>
        );

      case 'geometric':
        return (
          <div className="absolute inset-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute border border-blue-400/20"
                style={{
                  width: 100 + i * 20,
                  height: 100 + i * 20,
                  left: '50%',
                  top: '50%',
                  marginLeft: -(50 + i * 10),
                  marginTop: -(50 + i * 10),
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 20 + i * 5,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {renderVariant()}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20" />
    </div>
  );
};

export default AnimatedBackground;
