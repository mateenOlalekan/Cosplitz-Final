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
  getToken,
} from "../endpoints/auth";

// ============ QUERY KEYS ============
export const authKeys = {
  all: ['auth'],
  user: () => [...authKeys.all, 'user'],
  tempRegister: () => [...authKeys.all, 'tempRegister'],
};

// ============ STORAGE HELPERS ============
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

// ============ QUERIES ============

export const useUser = ({ enabled } = {}) => {
  const token = getToken();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getUserInfoEndpoint,
    enabled: Boolean(token) && enabled !== false,
    staleTime: 5 * 60 * 1000,
    retry: false,
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
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
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
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
    },
  });
};

// ============ REGISTRATION FLOW ============

export const useRegistrationFlow = () => {
  const queryClient = useQueryClient();
  const verifyOTPMutation = useVerifyOTP();
  const loginMutation = useLogin();

  const executeFlow = async (userData) => {
    try {
      const regData = await registerEndpoint({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
        nationality: userData.nationality,
      });
      
      await loginMutation.mutateAsync({
        credentials: {
          email: userData.email,
          password: userData.password,
        },
        remember: true,
      });
      
      await getOTPEndpoint(regData.userId);
      
      const tempData = {
        userId: regData.userId,
        email: regData.email,
        firstName: regData.firstName,
        lastName: regData.lastName,
      };
      
      saveTempRegister(tempData);
      queryClient.setQueryData(authKeys.tempRegister(), tempData);
      
      return tempData;
    } catch (error) {
      console.error('Registration flow error:', error);
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