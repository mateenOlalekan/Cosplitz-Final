// src/hooks/useAuth.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useLogout } from '../services/queries/auth';

export function useAuth() {
  const navigate = useNavigate();
  const { data: user, isLoading, isError, error } = useUser();
  const logoutMutation = useLogout();

  const isAuthenticated = !!user && !isError;
  const isAuthLoading = isLoading;

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    navigate('/login', { replace: true });
  }, [logoutMutation, navigate]);

  const requireAuth = useCallback((callback) => {
    if (!isAuthenticated && !isAuthLoading) {
      navigate('/login', { replace: true });
      return false;
    }
    return true;
  }, [isAuthenticated, isAuthLoading, navigate]);

  return {
    user,
    isLoading: isAuthLoading,
    isAuthenticated,
    isError,
    error,
    logout,
    requireAuth,
  };
}