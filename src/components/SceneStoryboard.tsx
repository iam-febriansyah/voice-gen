import React from 'react';
import { ScriptSegment } from '../types';
import {
  Sparkles,
  Gift,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Play,
  Volume2,
} from 'lucide-react';

interface SceneStoryboardProps {
  segments: ScriptSegment[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onAuditionSegment?: (segment: ScriptSegment) => void;
}

export const SceneStoryboard: React.FC<SceneStoryboardProps> = ({
  segments,
  currentTime,
  onSeek,
  onAuditionSegment,
}) => {
  const getSceneIcon = (id: number) => {
    switch (id) {
      case 1:
        return <Sparkles className="w-5 h-5 text-rose-400" />;
      case 2:
        return <Gift className="w-5 h-5 text-pink-400" />;
      case 3:
        return <GraduationCap className="w-5 h-5 text-amber-400" />;
      case 4:
        return <HeartHandshake className="w-5 h-5 text-rose-300" />;
      case 5:
        return <MessageCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-rose-400" />;
    }
  };

  const getSceneThemeBg = (id: number, isActive: boolean) => {
    if (isActive) {
      return 'border-rose-500 bg-gradient-to-r from-rose-950/60 via-slate-900/90 to-pink-950/40 shadow-lg shadow-rose-950/50 ring-1 ring-rose-500/50';
    }
    return 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Storyboard Sinkronisasi Video 30 Detik</span>
            <span className="text-xs font-normal text-rose-400 px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-800/40">
              Live Cue Sync
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Kamera & teks narasi bergerak selaras dengan waktu pembacaan voice-over.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
          Target: <span className="text-white font-semibold">00:30.00</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {segments.map((seg) => {
          const isActive =
            currentTime >= seg.startSeconds && currentTime <= seg.endSeconds;
          const isPassed = currentTime > seg.endSeconds;

          return (
            <div
              key={seg.id}
              className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${getSceneThemeBg(
                seg.id,
                isActive
              )}`}
              onClick={() => onSeek(seg.startSeconds)}
            >
              {/* Dynamic progress bar along card bottom for active segment */}
              {isActive && (
                <div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-100"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        ((currentTime - seg.startSeconds) /
                          (seg.endSeconds - seg.startSeconds)) *
                          100
                      )
                    )}%`,
                  }}
                />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg border flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    {getSceneIcon(seg.id)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-200 font-mono bg-slate-800 px-2 py-0.5 rounded">
                        Cue #{seg.cueNumber}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {seg.timeRange.split(' --> ')[0].slice(3, 11)} →{' '}
                        {seg.timeRange.split(' --> ')[1].slice(3, 11)}
                      </span>
                      <span className="text-xs text-rose-300/80 font-medium px-2 py-0.5 rounded-full bg-rose-500/10">
                        {seg.category}
                      </span>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 animate-pulse">
                          <Volume2 className="w-3.5 h-3.5" /> ON AIR
                        </span>
                      )}
                    </div>

                    <p
                      className={`text-sm md:text-base font-medium leading-relaxed ${
                        isActive
                          ? 'text-white font-semibold'
                          : isPassed
                          ? 'text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      "{seg.text}"
                    </p>

                    <div className="text-[11px] text-slate-400/90 mt-1 italic flex items-center gap-1.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400/60" />
                      Arahan Suara: {seg.notes}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(seg.startSeconds);
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      isActive
                        ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                    }`}
                    title="Lompat ke segmen ini"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <span className="text-[10px] font-mono text-slate-400">
                    {(seg.endSeconds - seg.startSeconds).toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
