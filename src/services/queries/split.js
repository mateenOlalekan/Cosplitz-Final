// src/services/queries/splits.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSplitsEndpoint,
  getSplitByIdEndpoint,
  createSplitEndpoint,
  updateSplitEndpoint,
  patchSplitEndpoint,
  deleteSplitEndpoint,
} from '../endpoints/split';

// ============ QUERY KEYS ============

export const splitsKeys = {
  all: ['splits'],
  lists: () => [...splitsKeys.all, 'list'],
  list: (filters) => [...splitsKeys.lists(), { filters }],
  details: () => [...splitsKeys.all, 'detail'],
  detail: (id) => [...splitsKeys.details(), id],
};

// ============ QUERIES ============

/*Get all splits */
export const useSplits = () => {
  return useQuery({
    queryKey: splitsKeys.lists(),
    queryFn: getSplitsEndpoint,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/*Get split by ID */
export const useSplit = (id) => {
  return useQuery({
    queryKey: splitsKeys.detail(id),
    queryFn: () => getSplitByIdEndpoint(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============ MUTATIONS ============

/* Create split */
export const useCreateSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSplitEndpoint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: splitsKeys.lists() });
    },
  });
};

/* Update split (PUT - full update) */
export const useUpdateSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateSplitEndpoint(id, data),
    onSuccess: (result, variables) => {
      // Update cache for this specific split
      queryClient.setQueryData(splitsKeys.detail(variables.id), result);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: splitsKeys.lists() });
    },
  });
};

/* Patch split (PATCH - partial update)  */
export const usePatchSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => patchSplitEndpoint(id, data),
    onSuccess: (result, variables) => {
      queryClient.setQueryData(splitsKeys.detail(variables.id), result);
      queryClient.invalidateQueries({ queryKey: splitsKeys.lists() });
    },
  });
};

/* Delete split */
export const useDeleteSplit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSplitEndpoint,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: splitsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: splitsKeys.lists() });
    },
  });
};