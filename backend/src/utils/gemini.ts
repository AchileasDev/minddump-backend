import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Analyzes a journal entry using Google's Gemini 1.5 Pro model
 * @param text - The journal entry text to analyze
 * @returns The analysis response from Gemini, or a fallback message if an error occurs
 */
export async function analyzeDumpWithGemini(text: string): Promise<string> {
  try {
    // Initialize the Gemini client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Prepare the prompt
    const prompt = `Analyze the following journal entry and provide emotional and behavioral insights:\n\n${text}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Get the text response
    const analysis = response.text();
    
    if (!analysis) {
      throw new Error('Empty response from Gemini');
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing text with Gemini:', error);
    return 'I apologize, but I was unable to analyze your journal entry at this time. Please try again later.';
  }
} 