import { NextApiRequest, NextApiResponse } from 'next';
import { analyzeDumpWithGemini } from '../../../../backend/src/utils/gemini';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: 'The request must include a "text" field containing the journal entry'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        details: 'The journal entry cannot be empty'
      });
    }

    // Get analysis from Gemini
    const analysis = await analyzeDumpWithGemini(text);

    // Return the analysis
    return res.status(200).json({ 
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error in analyze-dump:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze journal entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 