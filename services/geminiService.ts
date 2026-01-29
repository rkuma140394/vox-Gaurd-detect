
import { AnalysisResult, Language } from "../types";

/**
 * Calls the hackathon-compliant backend endpoint.
 * Includes mandatory x-api-key header.
 */
export const analyzeVoiceSample = async (
  audioBase64: string,
  audioFormat: string,
  language: Language,
  hackathonApiKey: string
): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/voice-detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': hackathonApiKey,
      },
      body: JSON.stringify({
        language,
        audioFormat: 'mp3', // Hackathon requirement specifies MP3
        audioBase64
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Server authentication failed');
    }

    return data as AnalysisResult;
  } catch (error: any) {
    console.error("API Call Failed:", error);
    return {
      status: 'error',
      language: language,
      classification: 'HUMAN_GENERATED',
      confidenceScore: 0,
      explanation: error.message || 'Connection to analysis endpoint failed.'
    } as any;
  }
};
