import { supabase } from '../utils/supabaseClient';
import { ReflectionQuestion, ReflectionAnswer } from '../types';

export async function getQuestions(): Promise<ReflectionQuestion[]> {
  const { data, error } = await supabase
    .from('reflection_questions')
    .select('id, text');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function saveAnswer(userId: string, questionId: string, answer: string): Promise<void> {
  const { error } = await supabase
    .from('reflection_answers')
    .insert([{ user_id: userId, question_id: questionId, answer }]);
  if (error) throw new Error(error.message);
}

export async function getUserAnswers(userId: string): Promise<ReflectionAnswer[]> {
  const { data, error } = await supabase
    .from('reflection_answers')
    .select('question_id, user_id, answer, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    questionId: row.question_id,
    userId: row.user_id,
    answer: row.answer,
    timestamp: row.created_at,
  }));
}