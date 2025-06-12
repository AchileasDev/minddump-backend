import { useTrial } from '../hooks/useTrial';

export async function analyzeEntry(entry: string) {
  // Check if user has access to premium features
  const { canAccessPremium } = useTrial();
  
  if (!canAccessPremium()) {
    throw new Error('Premium access required');
  }

  const response = await fetch('/api/analyze-entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: entry }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze entry');
  }

  return response.json();
} 