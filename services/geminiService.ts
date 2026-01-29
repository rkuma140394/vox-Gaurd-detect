
import { AnalysisResult, Language } from "../types";

/**
 * Calls the local backend endpoint which then communicates with Gemini.
 * This protects your API key and provides the structure needed for the hackathon.
 */
export const analyzeVoiceSample = async (
  audioBase64: string,
  mimeType: string,
  language: Language
): Promise<AnalysisResult> => {
  try {
    const response = await fetch('/api/voice-detection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioBase64,
        mimeType,
        language
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Server error');
    }

    const result = await response.json();
    return result as AnalysisResult;
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
