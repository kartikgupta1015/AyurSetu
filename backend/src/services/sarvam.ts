export async function convertSpeechToText(audioBase64: string, language: string = 'hi'): Promise<string> {
  // Real implementation would POST to Sarvam AI Saarika ASR API
  // Returning mock text for demonstration
  return "मुझे दो दिन से बुखार है और सिर चकरा रहा है";
}
