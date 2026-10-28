import React, { useRef, useEffect } from 'react';
import { ScriptSegment } from '../types';

interface AudioWaveformProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  segments: ScriptSegment[];
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  currentTime,
  duration,
  isPlaying,
  onSeek,
  segments,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate deterministic pseudo-random waveform bar heights
  const barsCount = 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const progressRatio = duration > 0 ? currentTime / duration : 0;
      const barWidth = width / barsCount;

      for (let i = 0; i < barsCount; i++) {
        const x = i * barWidth;
        const normX = i / barsCount;

        // Base amplitude profile resembling speech cadence
        const speechShape =
          Math.sin(normX * Math.PI * 4) * 0.35 +
          Math.sin(normX * Math.PI * 10) * 0.25 +
          0.45;

        // Add subtle dynamic animation if playing
        const dynamicFactor = isPlaying
          ? Math.sin(Date.now() * 0.008 + i * 0.5) * 0.15
          : 0;

        const barHeight = Math.max(
          6,
          Math.min(height - 8, (speechShape + dynamicFactor) * (height * 0.75))
        );
        const y = (height - barHeight) / 2;

        const isPast = normX <= progressRatio;

        // Gradients: Warm Rose/Gold for played, sleek slate for unplayed
        if (isPast) {
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#f43f5e'); // rose-500
          grad.addColorStop(0.5, '#fb7185'); // rose-400
          grad.addColorStop(1, '#fda4af'); // rose-300
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = '#334155'; // slate-700
        }

        // Draw rounded bar
        ctx.beginPath();
        const r = Math.min(barWidth * 0.35, 3);
        const bw = barWidth * 0.65;
        ctx.roundRect(x + (barWidth - bw) / 2, y, bw, barHeight, r);
        ctx.fill();
      }

      // Draw segment markers
      if (duration > 0) {
        segments.forEach((seg) => {
          const segRatio = seg.startSeconds / duration;
          if (segRatio <= 1) {
            const markerX = segRatio * width;
            ctx.fillStyle = '#f59e0b'; // amber-500
            ctx.fillRect(markerX - 1, 0, 2, 8);
            ctx.fillRect(markerX - 1, height - 8, 2, 8);
          }
        });
      }

      // Draw playhead cursor line
      const playheadX = progressRatio * width;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = isPlaying ? 10 : 4;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(playheadX - 1.5, 0, 3, height);
      ctx.shadowBlur = 0;

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentTime, duration, isPlaying, segments]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(clickRatio * duration);
  };

  return (
    <div className="relative w-full select-none">
      <canvas
        ref={canvasRef}
        width={800}
        height={90}
        onClick={handleCanvasClick}
        className="w-full h-20 sm:h-24 bg-slate-950/80 rounded-xl cursor-pointer border border-slate-800 hover:border-slate-700 transition shadow-inner"
        title="Click to seek anywhere on the 30-second timeline"
      />
      {/* Timeline markers display */}
      <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono mt-1.5 px-1">
        <span>00:00.0 (Intro)</span>
        <span className="text-amber-400/90 font-medium">00:00.7 (Cue 1)</span>
        <span className="text-amber-400/90 font-medium">00:05.4 (Cue 2)</span>
        <span className="text-amber-400/90 font-medium">00:11.2 (Cue 3)</span>
        <span className="text-amber-400/90 font-medium">00:20.3 (Cue 4)</span>
        <span className="text-amber-400/90 font-medium">00:25.3 (Cue 5)</span>
        <span>00:30.0 (End)</span>
      </div>
    </div>
  );
};
