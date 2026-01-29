
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;

// Middleware for handling large base64 audio uploads (Deepfakes can be high bitrate)
app.use(express.json({ limit: '50mb' }));

// Serve the bundled frontend files
app.use(express.static(__dirname));

/**
 * HACKATHON ENDPOINT: POST /api/voice-detection
 * This is the core endpoint for the forensic analysis.
 */
app.post('/api/voice-detection', async (req, res) => {
  const { audioBase64, mimeType, language } = req.body;

  if (!process.env.API_KEY) {
    console.error("API_KEY is missing in environment variables.");
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error: API Key not configured."
    });
  }

  if (!audioBase64 || !language) {
    return res.status(400).json({
      status: "error",
      message: "Bad Request: audioBase64 and language are required fields."
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-3-flash-preview for high-speed multi-modal analysis
    const model = 'gemini-3-flash-preview';

    const prompt = `You are a world-class forensic audio engineer specializing in AI voice detection. 
    Analyze the provided audio sample in ${language}. 
    Determine if the voice is AI_GENERATED (Deepfake/TTS) or HUMAN_GENERATED.
    
    Look for:
    1. Spectral anomalies (unnatural frequency cutoffs)
    2. Phase inconsistencies or robotic artifacts
    3. Unnatural breathing patterns or lack thereof
    4. Prosody and emotional cadence typical of specific AI models
    
    Return the response strictly in this JSON format:
    {
      "status": "success",
      "language": "${language}",
      "classification": "AI_GENERATED" or "HUMAN_GENERATED",
      "confidenceScore": float between 0.0 and 1.0,
      "explanation": "Detailed technical reasoning in one or two sentences."
    }`;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType || 'audio/mp3', data: audioBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);
    res.json(result);
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({
      status: "error",
      message: "Analysis failed. The audio sample may be corrupted or unsupported."
    });
  }
});

// Fallback for Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`VoxGuard Forensic Server running on port ${port}`);
});
