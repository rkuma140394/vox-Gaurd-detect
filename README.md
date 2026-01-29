
# VoxGuard: High-Accuracy Voice Authenticity API

VoxGuard is a forensic deepfake detection system compliant with the 2025 AI Hackathon requirements. It leverages **Gemini 3 Flash** with specialized **Thinking Budgets** to detect AI artifacts in Tamil, English, Hindi, Malayalam, and Telugu.

## Hackathon API Documentation

### Endpoint
`POST /api/voice-detection`

### Headers
| Header | Value |
| :--- | :--- |
| `Content-Type` | `application/json` |
| `x-api-key` | `sk_voxguard_2025` (Default) or your configured secret key |

## Google Cloud Deployment (Cloud Run)

The fastest way to deploy this to Google Cloud is using **Cloud Run**.

### 1. Prerequisites
- Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
- Initialize your project: `gcloud init`
- Enable required APIs:
  ```bash
  gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com
  ```

### 2. Deploy with One Command
Run the following command in your project root. This command will build your container via Cloud Build and deploy it to Cloud Run automatically.

```bash
gcloud run deploy voxguard-api \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="API_KEY=YOUR_GEMINI_API_KEY,HACKATHON_API_KEY=sk_voxguard_2025"
```

### 3. Update Environment Variables
To update secrets without redeploying code:
```bash
gcloud run services update voxguard-api --set-env-vars="API_KEY=new_key_here"
```

## Local Setup
1. `npm install`
2. `export API_KEY=your_gemini_api_key`
3. `npm run build`
4. `npm start`
