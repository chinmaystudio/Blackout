import { useEffect, useRef } from 'react';

/**
 * NoiseOverlay — Full-viewport fixed grain + vignette layer.
 * Uses canvas for performant noise generation.
 */
export default function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size the canvas (small — it gets scaled via CSS)
    canvas.width = 256;
    canvas.height = 256;

    // Generate static noise pattern
    const imageData = ctx.createImageData(256, 256);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.random() * 255;
      data[i] = val;     // R
      data[i + 1] = val; // G
      data[i + 2] = val; // B
      data[i + 3] = 255; // A
    }

    ctx.putImageData(imageData, 0, 0);

    // Regenerate periodically for movement effect
    const interval = setInterval(() => {
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
      }
      ctx.putImageData(imageData, 0, 0);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="noise-overlay">
        <canvas ref={canvasRef} className="noise-overlay__canvas" />
      </div>
      <div className="vignette-overlay" />
    </>
  );
}
