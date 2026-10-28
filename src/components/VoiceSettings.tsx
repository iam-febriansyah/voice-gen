import React from 'react';
import { VoiceOption } from '../types';
import { AVAILABLE_VOICES } from '../utils/audioUtils';
import { Mic, Sparkles, Sliders, Music2, ShieldCheck } from 'lucide-react';

interface VoiceSettingsProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  stylePrompt: string;
  onChangeStylePrompt: (style: string) => void;
  pacingNote: string;
  onChangePacingNote: (pacing: string) => void;
  isGenerating: boolean;
}

const PRESET_STYLES = [
  {
    name: 'Default: Warm & Elegant Narrator',
    tag: 'Rekomendasi Utama',
    prompt:
      'Warm, elegant, friendly Indonesian woman. Professional commercial narrator, soft and persuasive. Cheerful, sincere, and inviting. Medium pacing with natural pauses between sentences.',
    pacing: 'Medium with natural 0.7s - 1.5s pauses between sentences',
  },
  {
    name: 'Ceria & Festive (Wisuda & Ultah)',
    tag: 'Selebrasi',
    prompt:
      'Cheerful, enthusiastic, bright Indonesian woman. Friendly, celebratory promotional voice, clear diction, uplifting and joyful tone.',
    pacing: 'Brisk & energetic, crisp pauses',
  },
  {
    name: 'Menyentuh & Penuh Cinta (Hari Guru & Kasih Sayang)',
    tag: 'Emosional',
    prompt:
      'Gentle, tender, heartfelt Indonesian woman. Intimate, deeply sincere storytelling tone, comforting, soft spoken yet resonant and elegant.',
    pacing: 'Relaxed and gentle, thoughtful pauses',
  },
];

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  selectedVoice,
  onSelectVoice,
  stylePrompt,
  onChangeStylePrompt,
  pacingNote,
  onChangePacingNote,
  isGenerating,
}) => {
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Konfigurasi Karakter Suara & Gaya Narasi
            </h3>
            <p className="text-xs text-slate-400">
              Model Audio:{' '}
              <span className="text-rose-400 font-mono font-medium">
                gemini-3.8-flash-tts
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>24kHz Studio RIFF WAV</span>
        </div>
      </div>

      {/* Voice Selection Cards */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          Pilihan Suara Gemini (Voice Persona)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {AVAILABLE_VOICES.map((voice: VoiceOption) => {
            const isSelected = selectedVoice === voice.id;
            return (
              <div
                key={voice.id}
                onClick={() => !isGenerating && onSelectVoice(voice.id)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                  isSelected
                    ? 'border-rose-500 bg-rose-500/10 shadow-sm ring-1 ring-rose-500/40'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Mic
                      className={`w-3.5 h-3.5 ${
                        isSelected ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {voice.name}
                    </span>
                  </div>
                  {voice.isRecommended && (
                    <span className="text-[10px] bg-rose-500 text-white font-semibold px-1.5 py-0.2 rounded">
                      Rekomendasi
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-rose-300/90 font-medium mb-0.5">
                  {voice.tone}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-2">
                  {voice.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Directives */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1.5">
          Preset Arahan Sutradara (Directorial Presets)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {PRESET_STYLES.map((preset) => {
            const isActive = stylePrompt === preset.prompt;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onChangeStylePrompt(preset.prompt);
                  onChangePacingNote(preset.pacing);
                }}
                className={`text-left p-2.5 rounded-xl border text-xs transition ${
                  isActive
                    ? 'border-amber-500/80 bg-amber-500/10 text-white font-medium'
                    : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">{preset.name}</span>
                  <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {preset.tag}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2">
                  {preset.prompt}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Style Prompt Directive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
            <span>Speech Style Prompt (speechMetadata.style)</span>
            <span className="text-[10px] text-slate-500">Karakter & Emosi</span>
          </label>
          <textarea
            rows={3}
            value={stylePrompt}
            onChange={(e) => onChangeStylePrompt(e.target.value)}
            disabled={isGenerating}
            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            placeholder="Karakter suara narator..."
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1.5">
            <span>Pacing & Natural Pauses</span>
            <span className="text-[10px] text-slate-500">Jeda & Ritme</span>
          </label>
          <textarea
            rows={3}
            value={pacingNote}
            onChange={(e) => onChangePacingNote(e.target.value)}
            disabled={isGenerating}
            className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
            placeholder="Instruksi jeda dan tempo..."
          />
        </div>
      </div>
    </div>
  );
};
