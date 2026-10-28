import React, { useState } from 'react';
import { ScriptSegment } from '../types';
import {
  generateSrtContent,
  generateFullScriptText,
  downloadFile,
} from '../utils/audioUtils';
import {
  FileText,
  Copy,
  Download,
  RotateCcw,
  Check,
  MessageSquareShare,
  SlidersHorizontal,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ScriptEditorProps {
  segments: ScriptSegment[];
  onUpdateSegmentText: (id: number, text: string) => void;
  onResetToDefault: () => void;
  isGenerating: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  segments,
  onUpdateSegmentText,
  onResetToDefault,
  isGenerating,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'raw_srt' | 'clean_text'>(
    'cards'
  );
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleExportSrt = () => {
    const srtText = generateSrtContent(segments);
    downloadFile(
      srtText,
      'faura_bouquet_promo_30s_voiceover.srt',
      'text/plain;charset=utf-8'
    );
  };

  const srtContent = generateSrtContent(segments);
  const cleanScript = generateFullScriptText(segments);

  const whatsappMessage = encodeURIComponent(
    `Halo Faura Bouquet Depok! Saya ingin pesan buket bunga / merchandise untuk momen spesial saya. Mohon info katalog terbarunya ya!`
  );
  const whatsappUrl = `https://wa.me/6281234567890?text=${whatsappMessage}`;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" />
            <span>Naskah Voice-Over Promosi (Indonesian Script)</span>
          </h3>
          <p className="text-xs text-slate-400">
            5 Segmen terstruktur dengan timestamp SRT presisi 30 detik untuk iklan Faura Bouquet.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              viewMode === 'cards'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Editor Segmen
          </button>
          <button
            onClick={() => setViewMode('raw_srt')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              viewMode === 'raw_srt'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Format SRT
          </button>
          <button
            onClick={() => setViewMode('clean_text')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${
              viewMode === 'clean_text'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Naskah Utuh
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportSrt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Unduh File .SRT</span>
          </button>

          <button
            onClick={() => handleCopy(srtContent, 'srt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copiedType === 'srt' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copiedType === 'srt' ? 'Tersalin!' : 'Salin SRT'}</span>
          </button>

          <button
            onClick={() => handleCopy(cleanScript, 'clean')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            {copiedType === 'clean' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copiedType === 'clean' ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 transition"
          >
            <MessageSquareShare className="w-3.5 h-3.5" />
            <span>Tes Pesan WhatsApp Faura Depok</span>
          </a>

          <button
            onClick={onResetToDefault}
            disabled={isGenerating}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-400 hover:text-slate-200 transition"
            title="Reset naskah ke versi awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Naskah</span>
          </button>
        </div>
      </div>

      {/* Editor Content based on viewMode */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/90 hover:border-slate-700 space-y-2 transition"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-bold">
                    Segmen {seg.cueNumber}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {seg.timeRange}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {seg.category}
                </span>
              </div>

              <textarea
                value={seg.text}
                onChange={(e) => onUpdateSegmentText(seg.id, e.target.value)}
                disabled={isGenerating}
                rows={2}
                className="w-full text-sm bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-rose-500 transition leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="italic">{seg.notes}</span>
                <span className="font-mono text-slate-400">
                  {seg.text.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === 'raw_srt' && (
        <div className="relative">
          <pre className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
            {srtContent}
          </pre>
        </div>
      )}

      {viewMode === 'clean_text' && (
        <div className="relative">
          <pre className="w-full bg-slate-950 text-slate-200 font-sans text-sm p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {cleanScript}
          </pre>
        </div>
      )}
    </div>
  );
};
