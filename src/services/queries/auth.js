// src/services/queries/auth.js
// REFACTORED - Complete registration flow with proper state

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
  if (data) {
    console.log('💾 Saving temp register data:', data);
    localStorage.setItem('tempRegister', JSON.stringify(data));
  } else {
    console.log('🗑️ Clearing temp register data');
    localStorage.removeItem('tempRegister');
  }
};

const getTempRegister = () => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('tempRegister');
  return data ? JSON.parse(data) : null;
};

// Track registration state to enforce flow
const saveRegistrationState = (state) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('registrationState', JSON.stringify({
    ...state,
    timestamp: new Date().toISOString(),
  }));
};

const getRegistrationState = () => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem('registrationState');
  return data ? JSON.parse(data) : null;
};

const clearRegistrationState = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('registrationState');
};

// ============ QUERIES ============

export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getUserInfoEndpoint,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: typeof window !== 'undefined' && !!getToken(),
  });
};

export const useTempRegister = () => {
  return useQuery({
    queryKey: authKeys.tempRegister(),
    queryFn: getTempRegister,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

export const useRegistrationState = () => {
  return useQuery({
    queryKey: authKeys.registrationState(),
    queryFn: getRegistrationState,
    staleTime: Infinity,
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
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
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
      });
      
      // Set user data
      queryClient.setQueryData(authKeys.user(), data.user);
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: resendOTPEndpoint,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutEndpoint,
    onSuccess: () => {
      clearRegistrationState();
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

// ============ REGISTRATION FLOW ============

export const useRegistrationFlow = () => {
  const queryClient = useQueryClient();
  const verifyOTPMutation = useVerifyOTP();

  const executeFlow = async (userData) => {
    console.log('🚀 Starting registration flow');
    
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
    });
    
    return tempData;
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
  return useMutation({
    mutationFn: async (onboardingData) => {
      // Save onboarding data
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      
      // Update registration state
      saveRegistrationState({
        emailVerified: true,
        needsOnboarding: false,
        needsKYC: true,
      });
      
      return { success: true };
    },
  });
};

export const useCompleteKYC = () => {
  return useMutation({
    mutationFn: async (kycData) => {
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
  });
};