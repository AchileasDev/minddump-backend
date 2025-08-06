import { supabase } from '../utils/supabaseClient';

export async function getFavorites(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('question_id')
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
  return data ? data.map((row: any) => row.question_id) : [];
}

export async function addFavorite(userId: string, questionId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .insert([{ user_id: userId, question_id: questionId }]);
  if (error) throw new Error(error.message);
}

export async function removeFavorite(userId: string, questionId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('question_id', questionId);
  if (error) throw new Error(error.message);
}