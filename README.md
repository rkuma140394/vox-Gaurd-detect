
# VoxGuard: Voice Authenticity Analyzer

VoxGuard is a forensic audio analysis tool designed to detect AI-generated speech (deepfakes) across five languages: Tamil, English, Hindi, Malayalam, and Telugu.

## Features
- **Multimodal AI Analysis**: Uses Gemini 3 Flash to detect spectral and prosodic anomalies.
- **Multi-language Support**: Specialized detection for major regional languages.
- **Hackathon Ready**: Includes a structured API endpoint at `/api/voice-detection`.

## Deployment to Render.com
1. Connect this GitHub repository to a new **Web Service** on Render.
2. Set the **Build Command** to: `npm install && npm run build`
3. Set the **Start Command** to: `npm start`
4. Add an **Environment Variable** named `API_KEY` containing your Google Gemini API Key.

## API Specification
**Endpoint:** `POST /api/voice-detection`  
**Body:**
```json
{
  "audioBase64": "...",
  "mimeType": "audio/mp3",
  "language": "Tamil"
}
```
