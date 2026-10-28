import { ScriptSegment, VoiceOption } from '../types';

export const DEFAULT_SEGMENTS: ScriptSegment[] = [
  {
    id: 1,
    cueNumber: 1,
    timeRange: '00:00:00,700 --> 00:00:04,700',
    startSeconds: 0.7,
    endSeconds: 4.7,
    title: 'Ungkapan Rasa',
    category: 'Opening Hook',
    text: 'Setiap momen spesial, selalu ada cara indah untuk mengungkapkan rasa.',
    notes: 'Warm, soft opening hook. Elegant pacing, pauses after "spesial".',
  },
  {
    id: 2,
    cueNumber: 2,
    timeRange: '00:00:05,400 --> 00:00:10,500',
    startSeconds: 5.4,
    endSeconds: 10.5,
    title: 'Koleksi Bunga & Hadiah',
    category: 'Product Highlight',
    text: 'Dari buket bunga hingga hadiah unik, hadir untuk membuat orang tersayang tersenyum.',
    notes: 'Sweet, sincere emotion. Friendly commercial cadence.',
  },
  {
    id: 3,
    cueNumber: 3,
    timeRange: '00:00:11,200 --> 00:00:18,800',
    startSeconds: 11.2,
    endSeconds: 18.8,
    title: 'Momen Istimewa',
    category: 'Occasions & Variety',
    text: 'Untuk Hari Guru, ulang tahun, wisuda, merchandise, dan berbagai momen istimewa lainnya.',
    notes: 'Cheerful, celebratory cadence listing memorable milestones.',
  },
  {
    id: 4,
    cueNumber: 4,
    timeRange: '00:00:20,300 --> 00:00:24,600',
    startSeconds: 20.3,
    endSeconds: 24.6,
    title: 'Branding Faura Bouquet',
    category: 'Brand Sentiment',
    text: 'Faura Bouquet, hadiah sederhana yang menyampaikan begitu banyak rasa.',
    notes: 'Persuasive, emotional resonance, emphasize brand name softly.',
  },
  {
    id: 5,
    cueNumber: 5,
    timeRange: '00:00:25,300 --> 00:00:29,800',
    startSeconds: 25.3,
    endSeconds: 29.8,
    title: 'Call-to-Action WhatsApp',
    category: 'Closing CTA',
    text: 'Hubungi Faura Bouquet di Depok melalui WhatsApp. Yuk, buat momen spesial jadi lebih berkesan!',
    notes: 'Inviting, vibrant outro call to action for Depok orders.',
  },
];

export const AVAILABLE_VOICES: VoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore (Recommended)',
    gender: 'female',
    tone: 'Warm, Elegant, Sincere',
    description: 'Natural Indonesian female commercial narrator. Gentle, soothing, and persuasive tone.',
    isRecommended: true,
  },
  {
    id: 'Zephyr',
    name: 'Zephyr',
    gender: 'female',
    tone: 'Calm, Smooth, Melodic',
    description: 'Soft and articulate tone, suitable for delicate floral and boutique brand narratives.',
  },
  {
    id: 'Puck',
    name: 'Puck',
    gender: 'female',
    tone: 'Bright, Enthusiastic, Cheerful',
    description: 'Vibrant, high energy commercial read for festive occasions and quick promotions.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir',
    gender: 'male',
    tone: 'Warm, Deep, Reassuring',
    description: 'Rich, grounded baritone voice for corporate and premium commercial spots.',
  },
  {
    id: 'Charon',
    name: 'Charon',
    gender: 'male',
    tone: 'Confident, Resonant',
    description: 'Polished male announcer voice with steady, authoritative pacing.',
  },
];

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
}

export function generateSrtContent(segments: ScriptSegment[]): string {
  return segments
    .map((seg) => `${seg.cueNumber}\n${seg.timeRange}\n${seg.text}\n`)
    .join('\n');
}

export function generateFullScriptText(segments: ScriptSegment[]): string {
  return segments.map((s) => s.text).join('\n\n');
}

export function downloadFile(content: string | Blob, fileName: string, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Creates a clean 30-second procedural audio chime / preview tone or speech fallback
 * to guarantee instantaneous playback even if offline or before generating.
 */
export function createSyntheticPreviewAudio(segments: ScriptSegment[]): string {
  // Generate a minimal valid WAV audio file with pleasant studio warm chords matching the 30s timeline
  const sampleRate = 24000;
  const duration = 30.0;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + numSamples * 2, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count (1 = mono)
  view.setUint16(22, 1, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, numSamples * 2, true);

  // Fill audio data: subtle ambient studio tone with soft bell cues at segment starts
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Check if near a segment start to play gentle acoustic harp chime
    for (const seg of segments) {
      if (t >= seg.startSeconds && t <= seg.startSeconds + 1.2) {
        const dt = t - seg.startSeconds;
        const env = Math.exp(-dt * 3.5);
        const freq = 440 * Math.pow(1.2, seg.id);
        sample += Math.sin(2 * Math.PI * freq * dt) * env * 0.25;
      }
    }

    // Warm soft bed
    sample += Math.sin(2 * Math.PI * 130.81 * t) * 0.015;

    // Clamp to 16-bit PCM
    const intSample = Math.max(-32768, Math.min(32767, Math.floor(sample * 32767)));
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  // Convert buffer to base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
