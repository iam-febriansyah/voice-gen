import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));

  // Helper to create GoogleGenAI instance
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the server environment.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Endpoint to check status
  app.get('/api/status', (req: Request, res: Response) => {
    res.json({
      status: 'ready',
      model: 'gemini-3.8-flash-tts',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Main TTS generation endpoint using gemini-3.8-flash-tts
  app.post('/api/tts/generate', async (req: Request, res: Response) => {
    try {
      const {
        text,
        voiceName = 'Kore',
        style = 'Warm, elegant, friendly Indonesian woman. Professional commercial narrator, soft and persuasive. Cheerful, sincere, and inviting. Medium pacing with natural pauses between sentences.',
      } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text prompt is required.' });
      }

      const ai = getAiClient();

      // Call Gemini 3.8 Flash TTS
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style: style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName || 'Kore',
              },
            },
          },
        },
      });

      const candidatePart = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = candidatePart?.inlineData?.data;
      const mimeType = candidatePart?.inlineData?.mimeType || 'audio/wav';

      if (!base64Audio) {
        return res.status(500).json({
          error: 'No audio data received from Gemini TTS model. Check script or parameters.',
          raw: response.text || '',
        });
      }

      res.json({
        success: true,
        mimeType,
        audioBase64: base64Audio,
        audioUrl: `data:${mimeType};base64,${base64Audio}`,
        voiceName,
        model: 'gemini-3.8-flash-tts',
      });
    } catch (err: any) {
      console.error('Error generating speech with Gemini TTS:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate voice-over',
        details: err.toString(),
      });
    }
  });

  // Endpoint to generate audio for multiple segments in batch
  app.post('/api/tts/generate-segments', async (req: Request, res: Response) => {
    try {
      const {
        segments,
        voiceName = 'Kore',
        style = 'Warm, elegant, friendly Indonesian woman. Professional commercial narrator, soft and persuasive. Cheerful, sincere, and inviting. Medium pacing with natural pauses.',
      } = req.body;

      if (!Array.isArray(segments) || segments.length === 0) {
        return res.status(400).json({ error: 'Segments array is required.' });
      }

      const ai = getAiClient();
      const results: Array<{
        id: number | string;
        text: string;
        audioBase64: string;
        mimeType: string;
        startTime?: number;
        endTime?: number;
      }> = [];

      for (const seg of segments) {
        const segText = seg.text?.trim();
        if (!segText) continue;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: segText,
                  speechMetadata: {
                    style: seg.style || style,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName || 'Kore',
                },
              },
            },
          },
        });

        const part = response.candidates?.[0]?.content?.parts?.[0];
        const base64Audio = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType || 'audio/wav';

        if (base64Audio) {
          results.push({
            id: seg.id,
            text: segText,
            audioBase64: base64Audio,
            mimeType,
            startTime: seg.startTime,
            endTime: seg.endTime,
          });
        }
      }

      res.json({
        success: true,
        segments: results,
        voiceName,
        model: 'gemini-3.8-flash-tts',
      });
    } catch (err: any) {
      console.error('Error generating segments TTS:', err);
      res.status(500).json({
        error: err.message || 'Failed to generate segment audio',
        details: err.toString(),
      });
    }
  });

  // In development, mount Vite dev server middlewares
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Faura Voice Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
