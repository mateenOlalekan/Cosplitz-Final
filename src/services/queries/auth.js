// src/services/queries/auth.js

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  registerEndpoint,
  loginEndpoint,
  getOTPEndpoint,
  verifyOTPEndpoint,
  resendOTPEndpoint,
  getUserInfoEndpoint,
  logoutEndpoint,
} from '../endpoints/auth';

// ============ QUERY KEYS ============

export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  tempRegister: () => [...authKeys.all, 'tempRegister'],
};

// ============ STORAGE HELPERS ============

const saveTempRegister = (data) => {
  if (data) localStorage.setItem('tempRegister', JSON.stringify(data));
  else localStorage.removeItem('tempRegister');
};

const getTempRegister = () => {
  const data = localStorage.getItem('tempRegister');
  return data ? JSON.parse(data) : null;
};

// ============ QUERIES ============

/* Get current user (auto-refreshes if token exists) */
export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await getUserInfoEndpoint();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: !!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken'),
  });
};

/*Check if has pending registration */
export const useTempRegister = () => {
  return useQuery({
    queryKey: authKeys.tempRegister(),
    queryFn: getTempRegister,
    staleTime: Infinity,
  });
};

/* Login mutation */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ credentials, remember }) => 
      loginEndpoint(credentials, remember),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
};

/* Verify OTP mutation */
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOTPEndpoint,
    onSuccess: (data) => {
      // Clear temp registration
      saveTempRegister(null);
      queryClient.invalidateQueries({ queryKey: authKeys.tempRegister() });
      // Set verified user
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
};

/* Resend OTP mutation */
 
export const useResendOTP = () => {
  return useMutation({
    mutationFn: resendOTPEndpoint,
  });
};

/* Logout mutation */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutEndpoint,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.clear();
    },
  });
};

// ============ COMPLETE REGISTRATION FLOW ============

/**
 * Multi-step registration: Register → Auto-login → Get OTP
 * Returns function to execute flow and verification mutation
 */
export const useRegistrationFlow = () => {
  const queryClient = useQueryClient();

  // Step 4: Verify OTP (separate, user-triggered)
  const verifyOTP = useVerifyOTP();

  // Execute Steps 1-3
  const executeFlow = async (userData) => {
    // Step 1: Register
    const regData = await registerEndpoint(userData);
    
    // Step 2: Auto-login (hidden)
    await loginEndpoint({
      email: userData.email,
      password: userData.password,
    }, true);
    
    // Step 3: Get OTP
    await getOTPEndpoint(regData.userId);
    
    // Save temp data for verification step
    const tempData = {
      userId: regData.userId,
      email: regData.email,
      firstName: regData.firstName,
      lastName: regData.lastName,
    };
    saveTempRegister(tempData);
    queryClient.setQueryData(authKeys.tempRegister(), tempData);
    
    return tempData;
  };

  return {
    executeFlow,
    verifyOTP: verifyOTP.mutateAsync,
    resendOTP: useResendOTP().mutateAsync,
    isVerifying: verifyOTP.isPending,
  };
};

export const useAuthStatus = () => {
  const { data: user, isLoading } = useUser();
  
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};

