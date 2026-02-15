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
} from "../endpoints/auth";

export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  tempRegister: () => [...authKeys.all, 'tempRegister'],
  justRegistered: () => [...authKeys.all, 'justRegistered'],
  onboardingComplete: () => [...authKeys.all, 'onboardingComplete'],
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

export const useJustRegistered = () => {
  return useQuery({
    queryKey: authKeys.justRegistered(),
    queryFn: getJustRegistered,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
};

export const useOnboardingComplete = () => {
  return useQuery({
    queryKey: authKeys.onboardingComplete(),
    queryFn: getOnboardingComplete,
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
      // Regular login - NOT from registration
      // Clear registration flag and assume onboarding is complete for returning users
      setJustRegistered(false);
      setOnboardingComplete(true);
      
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.setQueryData(authKeys.justRegistered(), false);
      queryClient.setQueryData(authKeys.onboardingComplete(), true);
      
      // Invalidate to refresh
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOTPEndpoint,
    onSuccess: (data) => {
      console.log('OTP Verification successful, updating cache with user:', data.user);
      
      // Clear temp registration data
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
      
      // Set user data
      queryClient.setQueryData(authKeys.user(), data.user);
      
      // IMPORTANT: Keep the justRegistered flag true after OTP verification
      // This ensures the user is directed to post-onboarding
      // The flag will be cleared after they complete the onboarding flow
      console.log('Keeping justRegistered flag true for onboarding redirect');
      
      // Invalidate to refresh
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
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
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.justRegistered(), false);
      queryClient.setQueryData(authKeys.onboardingComplete(), false);
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
    queryClient.setQueryData(authKeys.justRegistered(), true);
    
    // Set onboarding as incomplete
    setOnboardingComplete(false);
    queryClient.setQueryData(authKeys.onboardingComplete(), false);
    
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