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
  if (data) {
    localStorage.setItem('tempRegister', JSON.stringify(data));
    console.log('Temp registration data saved:', data);
  } else {
    localStorage.removeItem('tempRegister');
    console.log('Temp registration data cleared');
  }
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

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ credentials, remember }) =>
      loginEndpoint(credentials, remember),
    onSuccess: (data) => {
      console.log('Login successful - regular login (not registration)');
      // Regular login - NOT from registration, so clear the flag
      setJustRegistered(false);
      // Assume returning users have completed onboarding
      setOnboardingComplete(true);
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      queryClient.setQueryData(authKeys.justRegistered(), false);
      queryClient.setQueryData(authKeys.onboardingComplete(), true);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyOTPEndpoint,
    onSuccess: (data) => {
      console.log('✓ OTP Verification successful');
      console.log('✓ User authenticated:', data.user);
      
      // Clear temp registration data
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
      
      // Set user data
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
      
      // IMPORTANT: Keep the justRegistered flag true after OTP verification
      // This flag will be checked to determine if user needs onboarding
      console.log('✓ User cache updated - ready for onboarding flow');
    },
    onError: (error) => {
      console.error('✗ OTP Verification failed:', error);
    }
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: resendOTPEndpoint,
    onSuccess: () => {
      console.log('✓ OTP resent successfully');
    },
    onError: (error) => {
      console.error('✗ Failed to resend OTP:', error);
    }
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutEndpoint,
    onSuccess: () => {
      console.log('Logout successful - clearing all auth data');
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
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('REGISTRATION FLOW STARTED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Set the flag that user is in registration flow
    setJustRegistered(true);
    queryClient.setQueryData(authKeys.justRegistered(), true);
    console.log('✓ Registration flag set to TRUE');
    
    // Step 1: Register user
    console.log('→ Step 1: Creating account...');
    const regData = await registerEndpoint({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      password: userData.password,
      nationality: userData.nationality,
    });
    console.log('✓ Account created:', regData);

    // Step 2: Login user
    console.log('→ Step 2: Logging in...');
    await loginEndpoint({
      email: userData.email,
      password: userData.password,
    }, true);
    console.log('✓ Login successful');

    // Step 3: Request OTP
    console.log('→ Step 3: Requesting OTP...');
    await getOTPEndpoint(regData.userId);
    console.log('✓ OTP sent to:', userData.email);
    
    const tempData = {
      userId: regData.userId,
      email: regData.email,
      firstName: regData.firstName,
      lastName: regData.lastName,
    };
    
    saveTempRegister(tempData);
    queryClient.setQueryData(authKeys.tempRegister(), tempData);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('REGISTRATION FLOW: Awaiting Email Verification');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return tempData;
  };
  
  return {
    executeFlow,
    verifyOTP: verifyOTPMutation.mutateAsync,
    resendOTP: useResendOTP().mutateAsync,
    isVerifying: verifyOTPMutation.isPending,
  };
};