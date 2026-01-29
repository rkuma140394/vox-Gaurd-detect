
# VoxGuard: High-Accuracy Voice Authenticity API

VoxGuard is a forensic deepfake detection system compliant with the 2025 AI Hackathon requirements. It leverages **Gemini 3 Pro** with specialized **Thinking Budgets** to detect AI artifacts in Tamil, English, Hindi, Malayalam, and Telugu.

## Hackathon API Documentation

### Endpoint
`POST /api/voice-detection`

### Headers
| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |
| `x-api-key` | `sk_voxguard_2025` (Default) or your configured secret key |

### Request Body
```json
{
  "language": "Tamil",
  "audioFormat": "mp3",
  "audioBase64": "SUQzBAAA..."
}
```

### Response Body
```json
{
  "status": "success",
  "language": "Tamil",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.95,
  "explanation": "Detected unnatural spectral smoothing in high frequencies and robotic prosody patterns."
}
```

## Local Setup
1. `npm install`
2. `export API_KEY=your_gemini_api_key`
3. `npm run build`
4. `npm start`

## Deployment
This app is ready for instant deployment to Render, Vercel, or Railway. Ensure the `API_KEY` environment variable is set in your dashboard.
