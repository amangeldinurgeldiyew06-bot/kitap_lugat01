import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Dictionary, UserProfile, QuizQuestion } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetAllDictionaries() {
  const { actor, isFetching } = useActor();

  return useQuery<Dictionary[]>({
    queryKey: ['dictionaries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDictionaries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetDictionary(name: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Dictionary | null>({
    queryKey: ['dictionary', name],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDictionary(name);
    },
    enabled: !!actor && !isFetching && !!name,
  });
}

export function useCreateDictionary() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { name: string; sourceLanguage: string; targetLanguage: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDictionary(params.name, params.sourceLanguage, params.targetLanguage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useAddWordPair() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; sourceWord: string; translation: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWordPair(params.dictionaryName, params.sourceWord, params.translation);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useUpdateWordPair() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; originalWord: string; newWord: string; newTranslation: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWordPair(params.dictionaryName, params.originalWord, params.newWord, params.newTranslation);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useRemoveWordPair() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; sourceWord: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeWordPair(params.dictionaryName, params.sourceWord);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useMarkWordAsUnknown() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; word: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.markWordAsUnknown(params.dictionaryName, params.word);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useRemoveWordFromUnknown() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; word: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeWordFromUnknown(params.dictionaryName, params.word);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useToggleFavoriteWord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; word: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleFavoriteWord(params.dictionaryName, params.word);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}

export function useGetQuizQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; mode: 'general' | 'unknown' | 'favorite' }) => {
      if (!actor) throw new Error('Actor not available');
      if (params.mode === 'unknown') {
        return actor.getUnknownQuizQuestion(params.dictionaryName);
      } else if (params.mode === 'favorite') {
        return actor.getFavoriteQuizQuestion(params.dictionaryName);
      } else {
        return actor.getQuizQuestion(params.dictionaryName);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
    },
  });
}

export function useBulkImportWordPairs() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { dictionaryName: string; input: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.bulkImportWordPairs(params.dictionaryName, params.input);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.dictionaryName] });
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] });
    },
  });
}
