import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { entryId, questions } = req.body;

    // Validate input
    if (!entryId || typeof entryId !== 'string') {
      return res.status(400).json({ error: 'Invalid entryId' });
    }

    if (!Array.isArray(questions)) {
      return res.status(400).json({ error: 'Questions must be an array' });
    }

    // Validate each question
    for (const q of questions) {
      if (!q.question || typeof q.question !== 'string') {
        return res.status(400).json({ error: 'Each question must have a question string' });
      }
      if (q.context && typeof q.context !== 'string') {
        return res.status(400).json({ error: 'Question context must be a string' });
      }
    }

    // Forward request to Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ entryId, questions }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json(error);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error updating questions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 