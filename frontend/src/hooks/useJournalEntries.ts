import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReflectionQuestion {
  question: string;
  context: string;
}

interface JournalEntry {
  id: string;
  content: string;
  mood?: string;
  tags?: string[];
  reflection_questions?: ReflectionQuestion[];
  favorite_questions?: string[];
  emotions?: string[];
  sentiment?: string;
  sentiment_score?: number;
  insight?: string;
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
    
    try {
      const response = await api.getDumps();
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch journal entries');
      }
      
      let filteredData: JournalEntry[] = response.data as JournalEntry[];
      
      // Apply date filter if provided
      if (dateFilter) {
        filteredData = filteredData.filter((entry: JournalEntry) => {
          const entryDate = new Date(entry.created_at);
          return entryDate >= dateFilter.start && entryDate <= dateFilter.end;
        });
      }
      
      // Apply search filter if provided
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filteredData = filteredData.filter((entry: JournalEntry) => 
          entry.content.toLowerCase().includes(searchLower) ||
          (entry.reflection_questions && entry.reflection_questions.some((q: ReflectionQuestion) => 
            q.question.toLowerCase().includes(searchLower) ||
            q.context.toLowerCase().includes(searchLower)
          ))
        );
      }
      
      // Apply pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      return filteredData.slice(start, end);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Failed to fetch journal entries');
    }
  };

  const { data: entries, isPending, error } = useQuery({
    queryKey,
    queryFn,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ entryId, question }: { entryId: string; question: string }) => {
      try {
        const response = await api.toggleFavorite(entryId, question);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to toggle favorite');
        }
        
        return response.data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to toggle favorite');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', user?.id] });
      toast.success('Favorite updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update favorite');
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: { content: string; mood?: string; tags?: string[] }) => {
      try {
        const response = await api.createDump(data);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to create entry');
        }
        
        return response.data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to create entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', user?.id] });
      toast.success('Entry created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create entry');
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { content: string; mood?: string; tags?: string[] } }) => {
      try {
        const response = await api.updateDump(id, data);
        
        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to update entry');
        }
        
        return response.data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to update entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', user?.id] });
      toast.success('Entry updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update entry');
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.deleteDump(id);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to delete entry');
        }
        
        return response.data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw new Error(error.message);
        }
        throw new Error('Failed to delete entry');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries', user?.id] });
      toast.success('Entry deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete entry');
    },
  });

  return {
    entries,
    isLoading: isPending,
    error: error instanceof Error ? error.message : 'Failed to fetch journal entries',
    toggleFavorite: toggleFavoriteMutation.mutate,
    isTogglingFavorite: toggleFavoriteMutation.isPending,
    createEntry: createEntryMutation.mutate,
    isCreating: createEntryMutation.isPending,
    updateEntry: updateEntryMutation.mutate,
    isUpdating: updateEntryMutation.isPending,
    deleteEntry: deleteEntryMutation.mutate,
    isDeleting: deleteEntryMutation.isPending,
  };
} 