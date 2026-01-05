import { useEffect, useRef } from 'react';

const AnimatedWavesBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Variables de animación
    let time = 0;
    const waves = [
      { offset: 0, amplitude: 40, frequency: 0.005, speed: 0.02, color: 'rgba(59, 130, 246, 0.3)' },
      { offset: 100, amplitude: 50, frequency: 0.004, speed: 0.025, color: 'rgba(37, 99, 235, 0.2)' },
      { offset: 200, amplitude: 60, frequency: 0.003, speed: 0.015, color: 'rgba(29, 78, 216, 0.15)' },
    ];

    const drawWave = (wave: typeof waves[0], offset: number) => {
      ctx.beginPath();
      ctx.moveTo(-canvas.width, canvas.height);

      for (let x = -canvas.width; x < canvas.width * 2; x += 10) {
        const y = 
          canvas.height / 2 + 
          wave.amplitude * Math.sin(x * wave.frequency + time * wave.speed) +
          offset;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(canvas.width * 2, canvas.height);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();
    };

    const animate = () => {
      // Gradiente de fondo base
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e3a8a');
      gradient.addColorStop(0.5, '#2563eb');
      gradient.addColorStop(1, '#3b82f6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar ondas
      waves.forEach((wave, index) => {
        drawWave(wave, wave.offset);
      });

      time += 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-50"
    />
  );
};

export default AnimatedWavesBackground;
