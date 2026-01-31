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
  setJustRegistered,
  getJustRegistered,
  setOnboardingComplete,
  getOnboardingComplete,
  REGISTRATION_STEPS,
  getRegistrationStep,
  setRegistrationStep,
  clearRegistrationStep,
} from "../endpoints/auth";

export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  tempRegister: () => [...authKeys.all, 'tempRegister'],
  justRegistered: () => [...authKeys.all, 'justRegistered'],
  onboardingComplete: () => [...authKeys.all, 'onboardingComplete'],
  registrationStep: () => [...authKeys.all, 'registrationStep'],
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

export const useUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getUserInfoEndpoint,
    retry: (failureCount, error) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
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

// Hook to check if user just completed registration
export const useJustRegistered = () => {
  return useQuery({
    queryKey: authKeys.justRegistered(),
    queryFn: getJustRegistered,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

// Hook to check if user has completed onboarding
export const useOnboardingComplete = () => {
  return useQuery({
    queryKey: authKeys.onboardingComplete(),
    queryFn: getOnboardingComplete,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

// 🟢 NEW: Hook to track registration flow step
export const useRegistrationStep = () => {
  return useQuery({
    queryKey: authKeys.registrationStep(),
    queryFn: getRegistrationStep,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ credentials, remember }) =>
      loginEndpoint(credentials, remember),
    onSuccess: (data) => {
      // Regular login - NOT from registration, so clear the flag
      setJustRegistered(false);
      // Assume returning users have completed onboarding
      setOnboardingComplete(true);
      // 🟢 Clear registration flow state for regular login
      clearRegistrationStep();
      
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.setQueryData(authKeys.justRegistered(), false);
      queryClient.setQueryData(authKeys.onboardingComplete(), true);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.IDLE);
    },
  });
};

// 🟢 UPDATED: Verify OTP with flow state management
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOTPEndpoint,
    onSuccess: (data) => {
      console.log('✅ OTP Verification successful, updating cache with user:', data.user);
      
      // 🟢 Update flow state
      setRegistrationStep(REGISTRATION_STEPS.OTP_VERIFIED);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.OTP_VERIFIED);
      
      // Clear temp registration data
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
      
      // Set user data
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // Keep justRegistered flag true - user needs onboarding
      console.log('✅ User verified, ready for onboarding');
    },
    onError: (error) => {
      console.error('❌ OTP Verification failed:', error);
    }
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
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.justRegistered(), false);
      queryClient.setQueryData(authKeys.onboardingComplete(), false);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.IDLE);
    },
  });
};

// 🟢 UPDATED: Registration flow with explicit step tracking
export const useRegistrationFlow = () => {
  const queryClient = useQueryClient();
  const verifyOTPMutation = useVerifyOTP();

  const executeFlow = async (userData) => {
    console.log('🚀 Starting registration flow...');
    
    try {
      // 🟢 Step 1: Register
      const regData = await registerEndpoint({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
        nationality: userData.nationality,
      });
      console.log('✅ Registration successful');
      setRegistrationStep(REGISTRATION_STEPS.REGISTERED);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.REGISTERED);

      // 🟢 Step 2: Auto-login (hidden from user)
      await loginEndpoint({
        email: userData.email,
        password: userData.password,
      }, true);
      console.log('✅ Auto-login successful (hidden)');
      setRegistrationStep(REGISTRATION_STEPS.AUTO_LOGGED_IN);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.AUTO_LOGGED_IN);

      // 🟢 Step 3: Request OTP
      await getOTPEndpoint(regData.userId);
      console.log('✅ OTP sent');
      setRegistrationStep(REGISTRATION_STEPS.OTP_SENT);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.OTP_SENT);
      
      // 🟢 Save temp data for verification step
      const tempData = {
        userId: regData.userId,
        email: regData.email,
        firstName: regData.firstName,
        lastName: regData.lastName,
      };
      
      saveTempRegister(tempData);
      queryClient.setQueryData(authKeys.tempRegister(), tempData);
      
      // 🟢 Set justRegistered flag ONLY after OTP is sent
      setJustRegistered(true);
      queryClient.setQueryData(authKeys.justRegistered(), true);
      
      return tempData;
    } catch (error) {
      console.error('❌ Registration flow failed:', error);
      // Reset flow state on error
      setRegistrationStep(REGISTRATION_STEPS.IDLE);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.IDLE);
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

// 🟢 NEW: Helper to complete onboarding
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // This would call your backend API to mark onboarding complete
      // For now, just update local state
      setRegistrationStep(REGISTRATION_STEPS.POST_ONBOARDING_COMPLETE);
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.POST_ONBOARDING_COMPLETE);
      return { success: true };
    },
  });
};

// 🟢 NEW: Helper to complete KYC
export const useCompleteKYC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // This would call your backend API to mark KYC complete
      // For now, just update local state
      setRegistrationStep(REGISTRATION_STEPS.COMPLETE);
      setOnboardingComplete(true);
      
      queryClient.setQueryData(authKeys.registrationStep(), REGISTRATION_STEPS.COMPLETE);
      queryClient.setQueryData(authKeys.onboardingComplete(), true);
      
      // Clear registration-specific flags
      setJustRegistered(false);
      queryClient.setQueryData(authKeys.justRegistered(), false);
      
      return { success: true };
    },
  });
};