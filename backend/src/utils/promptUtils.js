/**
 * Builds the prompt for Gemini AI to analyze a series of journal entries.
 * @param {Array<Object>} entries - An array of journal entry objects, each with `created_at` and `content`.
 * @returns {string} The formatted prompt string.
 */
function generateInsightsPrompt(entries) {
  const joinedContent = entries.map(e => e.content).join('\n---\n');
  return `Analyze the following journal entries and provide insights. The user is on a premium plan.
Entries:
${joinedContent}
---
Generate a JSON object with the following structure:
{
  "summary": "A brief summary of the user's week.",
  "key_themes": ["theme1", "theme2", "theme3"],
  "mood_analysis": {
    "overall_mood": "positive/negative/neutral",
    "mood_distribution": { "joy": 0.5, "sadness": 0.2, "...": "..." }
  },
  "actionable_advice": [
    "Advice 1 based on the entries.",
    "Advice 2 based on the entries."
  ]
}
Respond only with the JSON object.`;
}

function buildKeywordsPrompt(entries) {
  const joined = entries.map(e => e.content).join('\\n---\\n');
  return `Analyze the following user journal entries. Extract the top 10 most frequent keywords (words or phrases) and, if possible, group them into themes like "work," "family," "health." Return a JSON object with two fields: "keywords" (an array of objects {word, count}) and "themes" (an array of objects {theme, keywords: [word, ...]}).

Entries:
${joined}

Respond only in JSON format.`;
}

module.exports = {
  generateInsightsPrompt,
  buildKeywordsPrompt,
}; 