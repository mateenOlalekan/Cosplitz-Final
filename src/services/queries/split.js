// src/services/queries/splits.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSplitsEndpoint,
  getSplitByIdEndpoint,
  getMySplitsEndpoint,
  createSplitEndpoint,
  updateSplitEndpoint,
  deleteSplitEndpoint,
  joinSplitEndpoint,
} from '../endpoints/split';

export const splitsKeys = {
  all: ['splits'],
  lists: () => [...splitsKeys.all, 'list'],
  my: () => [...splitsKeys.all, 'my'],
  detail: (id) => [...splitsKeys.all, 'detail', id],
};

// ============ QUERIES ============

export const useSplits = () => {
  return useQuery({
    queryKey: splitsKeys.lists(),
    queryFn: getSplitsEndpoint,
    staleTime: 30 * 1000,
    // Don't retry on 401 - let auth handle it
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

export const useMySplits = () => {
  return useQuery({
    queryKey: splitsKeys.my(),
    queryFn: getMySplitsEndpoint,
    staleTime: 10 * 1000,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

export const useSplit = (id) => {
  return useQuery({
    queryKey: splitsKeys.detail(id),
    queryFn: () => getSplitByIdEndpoint(id),
    enabled: !!id,
    staleTime: 10 * 1000,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

// ============ MUTATIONS ============

export const useCreateSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSplitEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: splitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: splitsKeys.my() });
    },
    onError: (error) => {
      // Handle 401 errors gracefully
      if (error?.status === 401) {
        console.error('Authentication required');
      }
    },
  });
};

export const useUpdateSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSplitEndpoint(id, data),
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData(splitsKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: splitsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: splitsKeys.my() });
    },
  });
};

export const useDeleteSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSplitEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: splitsKeys.all });
    },
  });
};

export const useJoinSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ splitId, paymentData }) => joinSplitEndpoint(splitId, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: splitsKeys.all });
      queryClient.invalidateQueries({ queryKey: splitsKeys.my() });
    },
  });
};