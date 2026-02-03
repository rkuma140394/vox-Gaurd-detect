
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

/**
 * HACKATHON ENDPOINT: POST /api/voice-detection
 * Optimized for Latency & Accuracy using Gemini 3 Flash + Balanced Thinking Budget.
 * Response time target: < 10 seconds.
 */
app.post('/api/voice-detection', async (req, res) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const { audioBase64, audioFormat, language } = req.body;

  const VALID_KEY = process.env.HACKATHON_API_KEY || 'sk_voxguard_2025';
  
  if (!apiKeyHeader || apiKeyHeader !== VALID_KEY) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid or missing x-api-key header."
    });
  }

  if (!process.env.API_KEY) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error: Gemini API key not configured on server."
    });
  }

  if (!audioBase64) {
    return res.status(400).json({
      status: "error",
      message: "Bad Request: audioBase64 is required."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const model = 'gemini-3-flash-preview';

    const systemInstruction = `You are a World-Class Audio Forensic Analyst. 
    Analyze the provided audio sample in ${language} to detect if it is HUMAN or AI_GENERATED.
    
    FORENSIC CRITERIA:
    - Spectral Smoothing: AI often smooths high frequencies or lacks natural "air" noise.
    - Rhythmic Jitter: Check for robotic micro-fluctuations in speech tempo.
    - Emotional Nuance: Look for natural variations in volume and pitch that AI lacks in ${language}.
    - Artifacts: Identify 'metallic' or 'electronic' background artifacts.
    
    Return the classification as either "HUMAN" or "AI_GENERATED".`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: audioBase64 } },
          { text: `Analyze the authenticity of this ${language} audio.` },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 8000 },
        maxOutputTokens: 1000,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { 
              type: Type.STRING, 
              enum: ["AI_GENERATED", "HUMAN"]
            },
            confidenceScore: { 
              type: Type.NUMBER
            },
            explanation: { 
              type: Type.STRING
            }
          },
          required: ["classification", "confidenceScore", "explanation"]
        }
      },
    });

    const result = JSON.parse(response.text);
    
    res.json({
      status: "success",
      language: language,
      classification: result.classification,
      confidenceScore: result.confidenceScore,
      explanation: result.explanation
    });

  } catch (error) {
    console.error('Forensic Engine Error:', error);
    res.status(500).json({
      status: "error",
      message: "Analysis timed out or failed. Please try a shorter sample."
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`VoxGuard Low-Latency API active on port ${port}`);
});
