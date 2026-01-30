// src/services/queries/auth.js
// FIXED - Better state management and error handling

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  registerEndpoint,
  loginEndpoint,
  getOTPEndpoint,
  verifyOTPEndpoint,
  resendOTPEndpoint,
  getUserInfoEndpoint,
  logoutEndpoint,
  getToken,
} from "../endpoints/auth";

// ============ QUERY KEYS ============
export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  tempRegister: () => [...authKeys.all, 'tempRegister'],
  registrationState: () => [...authKeys.all, 'registrationState'],
};

// ============ STORAGE HELPERS ============
const saveTempRegister = (data) => {
  if (typeof window === 'undefined') return;
  try {
    if (data) {
      console.log('💾 Saving temp register data:', data);
      localStorage.setItem('tempRegister', JSON.stringify(data));
    } else {
      console.log('🗑️ Clearing temp register data');
      localStorage.removeItem('tempRegister');
    }
  } catch (error) {
    console.error('Error saving temp register:', error);
  }
};

const getTempRegister = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('tempRegister');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting temp register:', error);
    return null;
  }
};

// Track registration state to enforce flow
const saveRegistrationState = (state) => {
  if (typeof window === 'undefined') return;
  try {
    const stateToSave = {
      ...state,
      timestamp: new Date().toISOString(),
    };
    console.log('💾 Saving registration state:', stateToSave);
    localStorage.setItem('registrationState', JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Error saving registration state:', error);
  }
};

const getRegistrationState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem('registrationState');
    const state = data ? JSON.parse(data) : null;
    
    // Check if state is stale (older than 24 hours)
    if (state?.timestamp) {
      const age = Date.now() - new Date(state.timestamp).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (age > maxAge) {
        console.log('⏰ Registration state expired, clearing');
        clearRegistrationState();
        return null;
      }
    }
    
    return state;
  } catch (error) {
    console.error('Error getting registration state:', error);
    return null;
  }
};

const clearRegistrationState = () => {
  if (typeof window === 'undefined') return;
  try {
    console.log('🗑️ Clearing registration state');
    localStorage.removeItem('registrationState');
    localStorage.removeItem('tempRegister');
    localStorage.removeItem('onboardingData');
    localStorage.removeItem('kycData');
  } catch (error) {
    console.error('Error clearing registration state:', error);
  }
};

// ============ QUERIES ============

export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      // Don't fetch if no token
      if (!getToken()) {
        throw new Error('No authentication token');
      }
      return getUserInfoEndpoint();
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error?.status === 401 || error?.message === 'No authentication token') {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    enabled: typeof window !== 'undefined' && !!getToken(),
  });
};

export const useTempRegister = () => {
  return useQuery({
    queryKey: authKeys.tempRegister(),
    queryFn: getTempRegister,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

export const useRegistrationState = () => {
  return useQuery({
    queryKey: authKeys.registrationState(),
    queryFn: getRegistrationState,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

// ============ MUTATIONS ============

export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ credentials, remember }) => 
      loginEndpoint(credentials, remember),
    onSuccess: (data) => {
      console.log('✅ Login successful, setting user data');
      queryClient.setQueryData(authKeys.user(), data.user);
      
      // Clear any stale registration state
      clearRegistrationState();
      queryClient.invalidateQueries({ queryKey: authKeys.registrationState() });
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
    },
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOTPEndpoint,
    onSuccess: (data) => {
      console.log('✅ OTP verified, updating state');
      
      // Clear temp registration data
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
      
      // Update registration state to mark email as verified
      saveRegistrationState({
        emailVerified: true,
        needsOnboarding: true,
        needsKYC: true,
        flowCompleted: false,
      });
      
      queryClient.invalidateQueries({ queryKey: authKeys.registrationState() });
      
      // Set user data
      if (data.user) {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
    },
    onError: (error) => {
      console.error('❌ OTP verification failed:', error);
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: resendOTPEndpoint,
    onError: (error) => {
      console.error('❌ Resend OTP failed:', error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutEndpoint,
    onSuccess: () => {
      console.log('✅ Logout successful');
      clearRegistrationState();
      queryClient.clear(); // Clear all queries
      queryClient.setQueryData(authKeys.user(), null);
    },
    onError: (error) => {
      console.error('❌ Logout failed:', error);
      // Force clear even on error
      clearRegistrationState();
      queryClient.clear();
    },
  });
};

// ============ REGISTRATION FLOW ============

export const useRegistrationFlow = () => {
  const queryClient = useQueryClient();
  const verifyOTPMutation = useVerifyOTP();

  const executeFlow = async (userData) => {
    console.log('🚀 Starting registration flow');
    
    try {
      // Step 1: Register user
      console.log('1️⃣ Registering user...');
      const regData = await registerEndpoint({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
        nationality: userData.nationality,
      });
      
      console.log('✅ Registration successful:', regData);
      
      // Step 2: Auto-login to get token
      console.log('2️⃣ Auto-logging in...');
      const loginData = await loginEndpoint({
        email: userData.email,
        password: userData.password,
      }, true);
      
      console.log('✅ Login successful, token saved');
      
      // Step 3: Request OTP with the new token
      console.log('3️⃣ Requesting OTP...');
      await getOTPEndpoint(regData.userId);
      
      console.log('✅ OTP sent');
      
      // Save temporary registration data
      const tempData = {
        userId: regData.userId,
        email: regData.email,
        firstName: regData.firstName,
        lastName: regData.lastName,
      };
      
      saveTempRegister(tempData);
      queryClient.setQueryData(authKeys.tempRegister(), tempData);
      
      // Save registration state
      saveRegistrationState({
        registered: true,
        emailVerified: false,
        needsOnboarding: true,
        needsKYC: true,
        flowCompleted: false,
      });
      
      queryClient.invalidateQueries({ queryKey: authKeys.registrationState() });
      
      return tempData;
    } catch (error) {
      console.error('❌ Registration flow failed:', error);
      throw error;
    }
  };

  return {
    executeFlow,
    verifyOTP: verifyOTPMutation.mutateAsync,
    resendOTP: useResendOTP().mutateAsync,
    isVerifying: verifyOTPMutation.isPending,
  };
};

// ============ ONBOARDING & KYC STATE ============

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (onboardingData) => {
      console.log('💾 Saving onboarding data');
      
      // Save onboarding data
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      
      // Update registration state
      saveRegistrationState({
        emailVerified: true,
        needsOnboarding: false,
        needsKYC: true,
        flowCompleted: false,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ Onboarding completed');
      queryClient.invalidateQueries({ queryKey: authKeys.registrationState() });
    },
    onError: (error) => {
      console.error('❌ Onboarding completion failed:', error);
    },
  });
};

export const useCompleteKYC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kycData) => {
      console.log('💾 Saving KYC data');
      
      // Save KYC data
      localStorage.setItem('kycData', JSON.stringify(kycData));
      
      // Update registration state - flow complete
      saveRegistrationState({
        emailVerified: true,
        needsOnboarding: false,
        needsKYC: false,
        flowCompleted: true,
      });
      
      return { success: true };
    },
    onSuccess: () => {
      console.log('✅ KYC completed');
      queryClient.invalidateQueries({ queryKey: authKeys.registrationState() });
    },
    onError: (error) => {
      console.error('❌ KYC completion failed:', error);
    },
  });
};