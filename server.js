
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

/**
 * HACKATHON ENDPOINT: POST /api/voice-detection
 * Optimized for High Precision Analysis using Gemini 3 Pro + Thinking Budget.
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
      message: "Internal Server Error: AI model credentials not configured."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-pro-preview for highest reasoning accuracy
    const model = 'gemini-3-pro-preview';

    const systemInstruction = `You are an elite Audio Forensic Expert specializing in Neural Speech Analysis and Deepfake Detection. 
    Your task is to analyze audio samples in ${language} and identify if they are HUMAN_GENERATED or AI_GENERATED.
    
    CRITERIA FOR ANALYSIS:
    1. PROSODY: Check for unnatural rhythmic precision or lack of emotional micro-variance common in ${language}.
    2. SPECTRAL TRACES: Identify metallic resonance or quantization artifacts in the high-frequency range.
    3. BREATHING: Human speech has involuntary respiratory patterns. AI often mimics this poorly or omits it.
    4. LINGUISTIC COHERENCE: Evaluate if the phonetic transitions are too "perfect" for natural human speech in ${language}.
    
    Be extremely critical. If the confidence is high, explain precisely what artifacts led to the conclusion.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: audioBase64 } },
          { text: `Perform a deep forensic analysis of this ${language} audio sample. Format the response as a JSON object.` },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        // Thinking budget allows the model to "reason" before answering, drastically improving accuracy
        thinkingConfig: { thinkingBudget: 16384 },
        maxOutputTokens: 20000, 
      },
    });

    // The text property contains the JSON response
    const result = JSON.parse(response.text);
    
    // Ensure the response matches the required hackathon format
    res.json({
      status: "success",
      language: language,
      classification: result.classification,
      confidenceScore: result.confidenceScore,
      explanation: result.explanation
    });
  } catch (error) {
    console.error('Forensic Analysis Error:', error);
    res.status(500).json({
      status: "error",
      message: "Deep Analysis failed. The audio sample might be too short or corrupted."
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`VoxGuard High-Precision API running on port ${port}`);
});
