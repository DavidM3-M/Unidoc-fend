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
      // ✅ REFACTORIZADO: navy rgba en lugar de azul
      { 
        offset: 0, 
        amplitude: 40, 
        frequency: 0.005, 
        speed: 0.02, 
        color: 'rgba(30, 58, 95, 0.3)' // navy con 30% opacidad
      },
      { 
        offset: 100, 
        amplitude: 50, 
        frequency: 0.004, 
        speed: 0.025, 
        color: 'rgba(21, 42, 69, 0.2)' // navy-dark con 20% opacidad
      },
      { 
        offset: 200, 
        amplitude: 60, 
        frequency: 0.003, 
        speed: 0.015, 
        color: 'rgba(15, 26, 42, 0.15)' // navy-darker con 15% opacidad
      },
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
      // ✅ REFACTORIZADO: Gradiente navy en lugar de azul
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e3a5f');      // navy base
      gradient.addColorStop(0.5, '#2a4a75');    // navy light
      gradient.addColorStop(1, '#3a5a8f');      // navy lighter
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar ondas
      waves.forEach((wave) => {
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