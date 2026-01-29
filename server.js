
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
 * Optimized for Ultra-High Precision Analysis using Gemini 3 Pro + Thinking Budget.
 */
app.post('/api/voice-detection', async (req, res) => {
  const apiKeyHeader = req.headers['x-api-key'];
  const { audioBase64, audioFormat, language } = req.body;

  // Validation against hackathon key (fallback to default if env not set)
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
    
    // Gemini 3 Pro for superior forensic reasoning
    const model = 'gemini-3-pro-preview';

    const systemInstruction = `You are a World-Class Audio Forensic Analyst specializing in Deepfake detection.
    Analyze the provided audio sample in ${language}.
    
    FORENSIC STEPS:
    1. Spectral Analysis: Look for 'metallic' smoothing, unnatural frequency cuts, or phase inconsistencies.
    2. Prosodic Verification: Humans have micro-hesitations, irregular breathing, and varied emotional pitch. AI voices are often 'too perfect' or have consistent rhythmic micro-jitter.
    3. Linguistic Authenticity: Check if phoneme transitions (especially in ${language}) sound synthesized.
    
    You must decide if it is HUMAN_GENERATED or AI_GENERATED.
    Be extremely critical. Your reputation depends on avoiding false negatives.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: audioBase64 } },
          { text: `Analyze this audio sample in ${language}. Provide a detailed forensic verdict.` },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        // Thinking budget enables the model to reason through complex acoustic features before answering.
        thinkingConfig: { thinkingBudget: 24000 },
        maxOutputTokens: 30000,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            classification: { 
              type: Type.STRING, 
              enum: ["AI_GENERATED", "HUMAN_GENERATED"],
              description: "The classification of the voice sample."
            },
            confidenceScore: { 
              type: Type.NUMBER,
              description: "Confidence level between 0 and 1."
            },
            explanation: { 
              type: Type.STRING,
              description: "Detailed technical explanation of the artifacts detected."
            }
          },
          required: ["classification", "confidenceScore", "explanation"]
        }
      },
    });

    const forensicResult = JSON.parse(response.text);
    
    // Return standard hackathon response format
    res.json({
      status: "success",
      language: language,
      classification: forensicResult.classification,
      confidenceScore: forensicResult.confidenceScore,
      explanation: forensicResult.explanation
    });

  } catch (error) {
    console.error('Forensic Engine Error:', error);
    res.status(500).json({
      status: "error",
      message: "Forensic analysis engine encountered an error. Ensure the audio is a valid Base64 MP3."
    });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`VoxGuard High-Accuracy API active on port ${port}`);
});
