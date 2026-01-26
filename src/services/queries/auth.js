// src/services/queries/auth.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  registerEndpoint,
  loginEndpoint,
  getOTPEndpoint,
  verifyOTPEndpoint,
  resendOTPEndpoint,
  getUserInfoEndpoint,
  logoutEndpoint,
} from "../endpoints/auth";


export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  tempRegister: () => [...authKeys.all, 'tempRegister'],
};


const saveTempRegister = (data) => {
  if (typeof window === 'undefined') return;
  if (data) localStorage.setItem('tempRegister', JSON.stringify(data));
  else localStorage.removeItem('tempRegister');
};

const getTempRegister = () => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('tempRegister');
  return data ? JSON.parse(data) : null;
};

const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};



export const useUser = () => {
  return useQuery({
    queryKey: userKeys.detail(),
    queryFn: getUserInfoEndpoint,
    retry: (failureCount, error) => {
      // Don't retry on 401 Unauthorized
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
  });
};

/* Get temp registration data */
export const useTempRegister = () => {
  return useQuery({
    queryKey: authKeys.tempRegister(),
    queryFn: getTempRegister,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

// ============ MUTATIONS ============

/* Login mutation */
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ credentials, remember }) => 
      loginEndpoint(credentials, remember),
    onSuccess: (data) => {
      // Immediately set user data to prevent 401 race condition
      queryClient.setQueryData(userKeys.detail(), data.user);
      // Then refetch to confirm
      queryClient.invalidateQueries({ queryKey: userKeys.detail() });
    },
  });
};

/* Verify OTP mutation  */
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOTPEndpoint,
    onSuccess: (data) => {
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
};

/**
 * Resend OTP mutation
 */
export const useResendOTP = () => {
  return useMutation({
    mutationFn: resendOTPEndpoint,
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutEndpoint,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

// ============ COMPLETE REGISTRATION FLOW ============

/**
 * Multi-step registration with proper sequencing
 * Flow: Register → Login → Get OTP
 */
export const useRegistrationFlow = () => {
  const queryClient = useQueryClient();
  const verifyOTP = useVerifyOTP();

  const executeFlow = async (userData) => {
    // Step 1: Register (no token needed)
    const regData = await registerEndpoint({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: userData.password,
      nationality: userData.nationality,
    });
    
    // Step 2: Auto-login (stores token)
    await loginEndpoint({
      email: userData.email,
      password: userData.password,
    }, true);
    
    // Step 3: Request OTP (uses token from login)
    await getOTPEndpoint(regData.userId);
    
    // Save temp data for verification step
    const tempData = {
      userId: regData.userId,
      email: regData.email,
      firstName: regData.firstName,
      lastName: regData.lastName,
    };
    saveTempRegister(tempData);
    
    // Update query cache
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