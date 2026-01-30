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
  setKYCComplete,
  getKYCComplete,
} from "../endpoints/auth";

export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  tempRegister: () => [...authKeys.all, 'tempRegister'],
  justRegistered: () => [...authKeys.all, 'justRegistered'],
  onboardingComplete: () => [...authKeys.all, 'onboardingComplete'],
  kycComplete: () => [...authKeys.all, 'kycComplete'],
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

// NEW: Hook to check if user just completed registration
export const useJustRegistered = () => {
  return useQuery({
    queryKey: authKeys.justRegistered(),
    queryFn: getJustRegistered,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

// NEW: Hook to check if user has completed onboarding
export const useOnboardingComplete = () => {
  return useQuery({
    queryKey: authKeys.onboardingComplete(),
    queryFn: getOnboardingComplete,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

export const useKYCComplete = () => {
  return useQuery({
    queryKey: authKeys.kycComplete(),
    queryFn: getKYCComplete,
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
      setJustRegistered(false);
      const kycComplete = localStorage.getItem('kycComplete') === 'true';
      if (kycComplete) {
        setOnboardingComplete(true);
      } else {
        setOnboardingComplete(false);
      }
      
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.setQueryData(authKeys.justRegistered(), false);
      queryClient.setQueryData(authKeys.onboardingComplete(), kycComplete);
    },
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOTPEndpoint,
    onSuccess: (data) => {
      console.log('OTP Verification successful, updating cache with user:', data.user);

      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      setJustRegistered(true);
      setOnboardingComplete(false); // Onboarding NOT complete until post-onboarding + KYC
      setKYCComplete(false); // KYC NOT complete yet
      
      queryClient.setQueryData(authKeys.justRegistered(), true);
      queryClient.setQueryData(authKeys.onboardingComplete(), false);
      queryClient.setQueryData(authKeys.kycComplete(), false);
      
      console.log('User cache updated, justRegistered=true, onboardingComplete=false');
    },
    onError: (error) => {
      console.error('OTP Verification failed:', error);
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
      queryClient.setQueryData(authKeys.kycComplete(), false);
    },
  });
};

// NEW: Mutation to mark onboarding as complete (after KYC)
export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // This is a client-side only operation
      setOnboardingComplete(true);
      setJustRegistered(false); // Clear the justRegistered flag
      return { success: true };
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.onboardingComplete(), true);
      queryClient.setQueryData(authKeys.justRegistered(), false);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

// NEW: Mutation to mark KYC as complete
export const useCompleteKYC = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      setKYCComplete(true);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.kycComplete(), true);
    },
  });
};

export const useRegistrationFlow = () => {
  const queryClient = useQueryClient();
  const verifyOTPMutation = useVerifyOTP();

  const executeFlow = async (userData) => {
    console.log('Starting registration flow...');
    
    // Set the flag that user is in registration flow
    setJustRegistered(true);
    setOnboardingComplete(false);
    setKYCComplete(false);
    
    queryClient.setQueryData(authKeys.justRegistered(), true);
    queryClient.setQueryData(authKeys.onboardingComplete(), false);
    queryClient.setQueryData(authKeys.kycComplete(), false);
    
    const regData = await registerEndpoint({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: userData.password,
      nationality: userData.nationality,
    });

    console.log('Registration successful, logging in...');

    await loginEndpoint({
      email: userData.email,
      password: userData.password,
    }, true);

    console.log('Login successful, requesting OTP...');
    await getOTPEndpoint(regData.userId);
    console.log('OTP sent');
    
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
    verifyOTP: verifyOTPMutation.mutateAsync,
    resendOTP: useResendOTP().mutateAsync,
    isVerifying: verifyOTPMutation.isPending,
  };
};
