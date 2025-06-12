import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse and validate request body
    const { entryId, question } = await req.json();

    if (!entryId || typeof entryId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid entryId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!question || typeof question !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid question' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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

    // Get the current entry to check ownership and current favorites
    const { data: entry, error: fetchError } = await supabase
      .from('journal_entries')
      .select('favorite_questions')
      .eq('id', entryId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      console.error('Error fetching entry:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch entry' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!entry) {
      return new Response(
        JSON.stringify({ error: 'Entry not found or unauthorized' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Toggle the favorite status
    const currentFavorites = entry.favorite_questions || [];
    const newFavorites = currentFavorites.includes(question)
      ? currentFavorites.filter((q: string) => q !== question)
      : [...currentFavorites, question];

    // Update the entry
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({ favorite_questions: newFavorites })
      .eq('id', entryId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating favorites:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update favorites' }),
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