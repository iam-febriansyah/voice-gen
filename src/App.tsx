import React, { useState, useRef, useEffect } from 'react';
import {
  DEFAULT_SEGMENTS,
  AVAILABLE_VOICES,
  formatTime,
  downloadFile,
  generateSrtContent,
  generateFullScriptText,
  createSyntheticPreviewAudio,
} from './utils/audioUtils';
import { ScriptSegment } from './types';
import { AudioWaveform } from './components/AudioWaveform';
import { SceneStoryboard } from './components/SceneStoryboard';
import { VoiceSettings } from './components/VoiceSettings';
import { ScriptEditor } from './components/ScriptEditor';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Radio,
  FileAudio,
  CheckCircle2,
  AlertCircle,
  Film,
  Flower2,
  Layers,
  Share2,
} from 'lucide-react';

export default function App() {
  const [segments, setSegments] = useState<ScriptSegment[]>(DEFAULT_SEGMENTS);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
  const [stylePrompt, setStylePrompt] = useState<string>(
    'Warm, elegant, friendly Indonesian woman. Professional commercial narrator, soft and persuasive. Cheerful, sincere, and inviting. Medium pacing with natural pauses between sentences.'
  );
  const [pacingNote, setPacingNote] = useState<string>(
    'Medium with natural 0.7s - 1.5s pauses between sentences. No background music, clean studio narration.'
  );

  // Audio Playback state
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioBase64, setAudioBase64] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30.0);
  const [volume, setVolume] = useState<number>(1.0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'storyboard' | 'script' | 'settings'>('storyboard');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize with initial audio tone/preview on first load so player is immediately interactive
  useEffect(() => {
    try {
      const initialB64 = createSyntheticPreviewAudio(DEFAULT_SEGMENTS);
      setAudioBase64(initialB64);
      setAudioUrl(`data:audio/wav;base64,${initialB64}`);
    } catch (e) {
      console.warn('Failed to initialize procedural preview audio', e);
    }
  }, []);

  // Sync audio element time
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(Math.max(audioRef.current.duration, 30.0));
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Audio playback error:', err);
      });
    }
  };

  const handleSeek = (seconds: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handlePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Keyboard shortcut: Space to play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Handle Voice-over generation with gemini-3.8-flash-tts
  const handleGenerateVoiceOver = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(false);

    try {
      // Prepare full script text with natural pauses between sentences
      const scriptText = segments.map((s) => s.text).join('\n\n');

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText,
          voiceName: selectedVoice,
          style: `${stylePrompt} Natural pauses between lines. Pacing: ${pacingNote}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses suara dari Gemini TTS API');
      }

      if (data.audioBase64) {
        setAudioBase64(data.audioBase64);
        const url = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
        setAudioUrl(url);
        setGenerationSuccess(true);

        // Auto play new audio
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
          }
        }, 300);
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      setGenerationError(
        err.message || 'Terjadi kesalahan saat memanggil model gemini-3.8-flash-tts.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadMasterWav = () => {
    if (!audioBase64) return;
    const binary = atob(audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'audio/wav' });
    downloadFile(
      blob,
      `Faura_Bouquet_VoiceOver_30s_${selectedVoice}_24kHz.wav`,
      'audio/wav'
    );
  };

  const handleUpdateSegmentText = (id: number, newText: string) => {
    setSegments((prev) =>
      prev.map((seg) => (seg.id === id ? { ...seg, text: newText } : seg))
    );
  };

  const handleResetToDefault = () => {
    setSegments(DEFAULT_SEGMENTS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        preload="auto"
      />

      {/* Top Studio Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
              <Flower2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Faura Voice Studio
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium">
                  gemini-3.8-flash-tts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Studio Pengisi Suara Iklan Promosi 30 Detik • Faura Bouquet Depok
              </p>
            </div>
          </div>

          {/* Quick Specs Pill */}
          <div className="flex items-center gap-2 text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Radio className="w-3.5 h-3.5 text-rose-400" />
              <span>Voice: <strong className="text-white font-medium">{selectedVoice}</strong> (Indonesian Female)</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <FileAudio className="w-3.5 h-3.5 text-amber-400" />
              <span>24kHz WAV PCM</span>
            </div>

            <button
              onClick={handleGenerateVoiceOver}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-xs sm:text-sm text-white transition shadow-lg ${
                isGenerating
                  ? 'bg-rose-900/60 cursor-wait'
                  : 'bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 shadow-rose-900/30 hover:shadow-rose-900/50 cursor-pointer active:scale-95'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Menyuarakan dengan Gemini...' : 'Generate Voice-Over'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Alerts / Feedback notification */}
        {generationSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Audio voice-over 30 detik berhasil di-generate dengan model <strong>gemini-3.8-flash-tts</strong> (Voice: {selectedVoice})! Siap didengarkan dan diunduh.
              </span>
            </div>
            <button
              onClick={() => setGenerationSuccess(false)}
              className="text-emerald-400 hover:text-emerald-300 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {generationError && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/60 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{generationError}</span>
            </div>
            <button
              onClick={() => setGenerationError(null)}
              className="text-rose-400 hover:text-rose-300 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Master Audio Console Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur">
          {/* Subtle floral studio glow background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  MASTER PROMO PLAYER • 30 SECONDS COMMERCIAL
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Faura Bouquet — "Hadiah Sederhana Berjuta Rasa"
                </h2>
              </div>

              {/* Download Master Audio & SRT Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadMasterWav}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
                  title="Unduh master audio format .WAV 24kHz untuk video editor"
                >
                  <Download className="w-3.5 h-3.5 text-rose-400" />
                  <span>Unduh .WAV (24kHz)</span>
                </button>

                <button
                  onClick={() =>
                    downloadFile(
                      generateSrtContent(segments),
                      'faura_bouquet_promo_subtitles.srt',
                      'text/plain;charset=utf-8'
                    )
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
                  title="Unduh file subtitle .SRT tersinkronisasi"
                >
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>Unduh .SRT</span>
                </button>
              </div>
            </div>

            {/* Interactive Audio Waveform Scrubber with Segment Cues */}
            <AudioWaveform
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              onSeek={handleSeek}
              segments={segments}
            />

            {/* Audio Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {/* Play / Seek / Reset */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSeek(0)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Reset ke awal (00:00.0)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSeek(currentTime - 5)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono"
                  title="Mundur 5 detik"
                >
                  -5s
                </button>

                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center transition shadow-lg shadow-rose-950/60 cursor-pointer"
                  title={isPlaying ? 'Jeda (Space)' : 'Putar (Space)'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <button
                  onClick={() => handleSeek(currentTime + 5)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono"
                  title="Maju 5 detik"
                >
                  +5s
                </button>

                {/* Time Display */}
                <div className="font-mono text-sm sm:text-base font-bold text-white bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="text-rose-400">{formatTime(currentTime)}</span>
                  <span className="text-slate-500 mx-1">/</span>
                  <span className="text-slate-400">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Speed & Volume Controls */}
              <div className="flex items-center gap-4">
                {/* Speed buttons */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                  {[0.8, 1.0, 1.1, 1.25].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handlePlaybackRate(rate)}
                      className={`px-2 py-0.5 rounded-lg transition ${
                        playbackRate === rate
                          ? 'bg-rose-500 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    className="text-slate-400 hover:text-white transition"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-16 sm:w-20 accent-rose-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('storyboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'storyboard'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Storyboard Video Sinkronisasi (30s)</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'script'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Naskah & Subtitle SRT</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'settings'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Karakter Suara & Arahan Emosi</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'storyboard' && (
          <SceneStoryboard
            segments={segments}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        )}

        {activeTab === 'script' && (
          <ScriptEditor
            segments={segments}
            onUpdateSegmentText={handleUpdateSegmentText}
            onResetToDefault={handleResetToDefault}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'settings' && (
          <VoiceSettings
            selectedVoice={selectedVoice}
            onSelectVoice={setSelectedVoice}
            stylePrompt={stylePrompt}
            onChangeStylePrompt={setStylePrompt}
            pacingNote={pacingNote}
            onChangePacingNote={setPacingNote}
            isGenerating={isGenerating}
          />
        )}

        {/* Video Production & Editing Integration Guide */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <span>Panduan Penggunaan untuk Editor Video (CapCut / Premiere Pro / DaVinci Resolve)</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-bold text-rose-400">1. Unduh Master .WAV</span>
              <p className="text-slate-400">
                File audio berspesifikasi 24.000 Hz, mono 16-bit PCM RIFF tanpa kompresi artefak, bersih tanpa backsound.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-bold text-amber-400">2. Import File .SRT</span>
              <p className="text-slate-400">
                Tiap kalimat sudah terpetakan pada detik presisi (0.7s, 5.4s, 11.2s, 20.3s, 25.3s) langsung pas dengan potongan footage.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400">3. Tambah Backsound Lembut</span>
              <p className="text-slate-400">
                Letakkan musik latar bertempo lambat/akustik pada volume -18dB sampai -22dB agar vokal narator wanita tetap dominan dan merdu.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Studio Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-4 mt-8 text-center text-xs text-slate-500">
        <p>
          Faura Bouquet Voice-Over Studio • Ditenagai oleh model AI{' '}
          <span className="text-slate-400 font-mono">gemini-3.8-flash-tts</span>{' '}
          • Depok, Jawa Barat
        </p>
      </footer>
    </div>
  );
}
