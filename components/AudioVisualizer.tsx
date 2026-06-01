import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  volume: number; // 0 to 1
  isActive: boolean;
  color: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ volume, isActive, color }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  
  // State for organic movement
  const timeRef = useRef(0);
  const smoothedVolumeRef = useRef(0);
  
  // Particle system
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Smooth volume transition
      const targetVolume = isActive ? Math.max(0.05, volume) : 0;
      smoothedVolumeRef.current += (targetVolume - smoothedVolumeRef.current) * 0.15;
      
      const v = smoothedVolumeRef.current;
      timeRef.current += 0.008 + (v * 0.04);

      // Clear with slight fade for trails
      ctx.fillStyle = 'rgba(8, 11, 20, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 120 + (Math.sin(timeRef.current * 0.3) * 8); 
      const maxExpansion = 100;

      // Extract RGB
      const rgbMatch = color.match(/\d+\s*,\s*\d+\s*,\s*\d+/);
      const rgb = rgbMatch ? rgbMatch[0] : '20, 184, 166'; // Default to teal

      // Update and Draw Particles
      if (v > 0.1) {
        // Emit particles from the center when there's sound
        const particleCount = Math.floor(v * 5);
        for (let i = 0; i < particleCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 3 * v;
          particlesRef.current.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            size: 1 + Math.random() * 3,
            opacity: 0.5 + Math.random() * 0.5
          });
        }
      }

      // Draw Particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        p.vx *= 0.99;
        p.vy *= 0.99;
        
        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${p.opacity * p.life})`;
          ctx.fill();
          return true;
        }
        return false;
      });

      // Draw Organic "Mind" Blob
      ctx.save();
      ctx.translate(centerX, centerY);

      // Multiple layers for depth
      for (let layer = 1; layer <= 4; layer++) {
        ctx.beginPath();
        const points = 120;
        
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          
          // More complex organic movement
          const wave1 = Math.sin(angle * 2 + timeRef.current * (layer * 0.4));
          const wave2 = Math.cos(angle * 4 - timeRef.current * 0.8);
          const wave3 = Math.sin(angle * 6 + timeRef.current * 1.5);
          const wave4 = Math.cos(angle * 3 + Math.sin(timeRef.current));
          
          const distortion = (wave1 * 0.4 + wave2 * 0.3 + wave3 * 0.2 + wave4 * 0.1) * (v * maxExpansion * (1 + layer * 0.1));
          const layerOffset = (layer - 1) * 15 * (1 + v);
          const r = baseRadius + distortion + layerOffset;
          
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            // Use quadratic curves for smoother look
            const nextAngle = ((i + 1) / points) * Math.PI * 2;
            const nextDistortion = (Math.sin(nextAngle * 2 + timeRef.current * (layer * 0.4)) * 0.4 + 
                                    Math.cos(nextAngle * 4 - timeRef.current * 0.8) * 0.3) * (v * maxExpansion);
            const nextR = baseRadius + nextDistortion + layerOffset;
            const nextX = Math.cos(nextAngle) * nextR;
            const nextY = Math.sin(nextAngle) * nextR;
            
            ctx.quadraticCurveTo(x, y, (x + nextX) / 2, (y + nextY) / 2);
          }
        }

        ctx.closePath();

        if (layer === 1) {
            ctx.fillStyle = `rgba(${rgb}, ${0.15 + v * 0.4})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(${rgb}, ${0.4 + v * 0.6})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        } else {
            ctx.strokeStyle = `rgba(${rgb}, ${0.1 / layer + v * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
      }
      
      // Core Nucleus
      const coreSize = 8 + (v * 15);
      ctx.beginPath();
      ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
      gradient.addColorStop(0, '#fff');
      gradient.addColorStop(0.5, `rgba(${rgb}, 0.8)`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 20 * (1 + v);
      ctx.shadowColor = `rgba(${rgb}, 0.8)`;
      ctx.fill();

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [volume, isActive, color]);

  return (
    <canvas
      ref={canvasRef}
      width={800} 
      height={800}
      className="w-full h-full object-contain"
    />
  );
};

export default AudioVisualizer;