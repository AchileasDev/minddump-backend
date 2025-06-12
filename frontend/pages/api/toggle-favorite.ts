import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { entryId, question } = req.body;

    // Validate input
    if (!entryId || typeof entryId !== 'string') {
      return res.status(400).json({ error: 'Invalid entryId' });
    }

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Invalid question' });
    }

    // Forward request to Supabase Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/toggle-favorite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ entryId, question }),
      }
    );

    // Forward the response status and body
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 