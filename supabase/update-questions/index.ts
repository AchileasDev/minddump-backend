import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ReflectionQuestion {
  question: string;
  context?: string;
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse and validate request body
    const { entryId, questions } = await req.json();

    if (!entryId || typeof entryId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid entryId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(questions)) {
      return new Response(
        JSON.stringify({ error: 'Questions must be an array' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate each question
    for (const q of questions) {
      if (!q.question || typeof q.question !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Each question must have a question string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (q.context && typeof q.context !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Question context must be a string' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Update the journal entry
    const { error } = await supabase
      .from('journal_entries')
      .update({ reflection_questions: questions })
      .eq('id', entryId)
      .eq('user_id', user.id); // Ensure the entry belongs to the user

    if (error) {
      console.error('DB update error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to update questions' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 