// supabase/functions/analyze-entry/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { OpenAI } from 'https://deno.land/x/openai@1.4.0/mod.ts';

serve(async (req) => {
  try {
    const { content } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // First, analyze emotions
    const emotionPrompt = `Analyze the following journal entry and identify the main emotions expressed. Return a JSON array of emotions, ordered by intensity:

"${content}"

Return the response in this exact format:
["emotion1", "emotion2", "emotion3"]`;

    const emotionCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: emotionPrompt }],
    });

    const emotions = JSON.parse(
      emotionCompletion.choices?.[0]?.message?.content || '[]',
    );

    // Then, generate reflection questions
    const questionPrompt = `Ένα άτομο έγραψε στο ημερολόγιο:\n"${content}"\n
Με βάση αυτό το κείμενο, γράψε 3 σύντομες και ενσυναισθητικές ερωτήσεις που θα το βοηθούσαν να σκεφτεί βαθύτερα ή να εκφραστεί καλύτερα.
Οι ερωτήσεις να είναι στη μορφή JSON array όπως:\n
["Ερώτηση 1", "Ερώτηση 2", "Ερώτηση 3"]`;

    const questionCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: questionPrompt }],
    });

    const questions = JSON.parse(
      questionCompletion.choices?.[0]?.message?.content || '[]',
    );

    const { error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        content,
        reflection_questions: questions,
      });

    if (error) {
      console.error('DB insert error:', error);
      return new Response('Failed to save entry', { status: 500 });
    }

    return new Response(
      JSON.stringify({ questions, emotions }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response('Internal Error', { status: 500 });
  }
});
