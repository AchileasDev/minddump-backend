import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ReflectionQuestion {
  question: string;
  context: string;
}

interface JournalEntry {
  id: string;
  content: string;
  reflection_questions: ReflectionQuestion[];
  favorite_questions: string[];
  created_at: string;
  updated_at: string;
}

interface UseJournalEntriesOptions {
  page?: number;
  pageSize?: number;
  searchQuery?: string;
  dateFilter?: {
    start: Date;
    end: Date;
  };
}

export function useJournalEntries(options: UseJournalEntriesOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    page = 1,
    pageSize = 10,
    searchQuery = '',
    dateFilter,
  } = options;

  const queryKey = ['journal-entries', user?.id, page, pageSize, searchQuery, dateFilter];
  const queryFn = async (): Promise<JournalEntry[]> => {
    if (!user) throw new Error('User must be authenticated');
    let query = supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (dateFilter) {
      query = query
        .gte('created_at', dateFilter.start.toISOString())
        .lte('created_at', dateFilter.end.toISOString());
    }
    const { data, error } = await query;
    if (error) throw error;
    let filteredData = data;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredData = data.filter(entry => 
        entry.content.toLowerCase().includes(searchLower) ||
        entry.reflection_questions.some((q: ReflectionQuestion) => 
          q.question.toLowerCase().includes(searchLower) ||
          q.context.toLowerCase().includes(searchLower)
        )
      );
    }
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredData.slice(start, end);
  };
  const { data: entries, isPending, error } = useQuery({
    queryKey,
    queryFn,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ entryId, question }: { entryId: string; question: string }) => {
      const { data: entry } = await supabase
        .from('journal_entries')
        .select('favorite_questions')
        .eq('id', entryId)
        .single();
      const currentFavorites = entry?.favorite_questions || [];
      const newFavorites = currentFavorites.includes(question)
        ? currentFavorites.filter((q: string) => q !== question)
        : [...currentFavorites, question];
      const { error } = await supabase
        .from('journal_entries')
        .update({ favorite_questions: newFavorites })
        .eq('id', entryId);
      if (error) throw error;
      return newFavorites;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', user?.id] });
    },
  });

  return {
    entries,
    isLoading: isPending,
    error: error instanceof Error ? error.message : 'Failed to fetch journal entries',
    toggleFavorite: toggleFavoriteMutation.mutate,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
  };
} 