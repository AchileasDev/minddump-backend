import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

const client = new GoogleGenerativeAI(apiKey);

export interface AnalyzeDumpRequest {
  content: string;
}

export interface AnalyzeDumpResponse {
  insight: string;
}

export async function analyzeDumpWithGemini(request: AnalyzeDumpRequest): Promise<AnalyzeDumpResponse> {
  try {
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(request.content);
    const response = await result.response;
    const insight = response.text() || 'No insight generated';

    return { insight };
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
} 