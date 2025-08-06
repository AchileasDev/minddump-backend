import { useState, useEffect, useCallback } from 'react';
import { api, ReflectionQuestion, ReflectionAnswer } from '@/lib/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useReflections = () => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<ReflectionQuestion[]>([]);
  const [answers, setAnswers] = useState<ReflectionAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    if (!user?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const qs = await api.getReflectionQuestions(user.access_token);
      setQuestions(qs);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch questions');
      toast.error(e.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  const fetchAnswers = useCallback(async () => {
    if (!user?.access_token) return;
    setLoading(true);
    setError(null);
    try {
      const as = await api.getReflectionAnswers(user.access_token);
      setAnswers(as);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch answers');
      toast.error(e.message || 'Failed to fetch answers');
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  useEffect(() => {
    if (user?.access_token) {
      fetchQuestions();
      fetchAnswers();
    }
  }, [user?.access_token, fetchQuestions, fetchAnswers]);

  const answerQuestion = async (questionId: string, answer: string) => {
    if (!user?.access_token) return;
    setLoading(true);
    try {
      await api.saveReflectionAnswer(questionId, answer, user.access_token);
      toast.success('Answer saved!');
      fetchAnswers();
    } catch (e: any) {
      setError(e.message || 'Failed to save answer');
      toast.error(e.message || 'Failed to save answer');
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    answers,
    loading,
    error,
    answerQuestion,
    refreshQuestions: fetchQuestions,
    refreshAnswers: fetchAnswers,
  };
};