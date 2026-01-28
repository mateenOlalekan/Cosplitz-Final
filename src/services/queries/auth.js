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
    initialData: undefined,
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
    onSuccess: async (data) => {
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
      if (!data.user) {
        try {
          const userInfo = await getUserInfoEndpoint();
          queryClient.setQueryData(authKeys.user(), userInfo);
        } catch (error) {
          console.error('Failed to fetch user info after OTP:', error);
          if (data.user) {
            queryClient.setQueryData(authKeys.user(), data.user);
          }
        }
      } else {
        queryClient.setQueryData(authKeys.user(), data.user);
      }
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

  const executeFlow = async (userData) => {
    try {
      const regData = await registerEndpoint({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        password: userData.password,
        nationality: userData.nationality,
      });
      
      // 🟢 FIX: Auto-login with verification
      const loginResult = await loginEndpoint({
        email: userData.email,
        password: userData.password,
      }, true);
      
      // 🟢 ADD: Verify token was set
      const tokenAfterLogin = getToken();
      if (!tokenAfterLogin) {
        throw new Error('Auto-login failed: No token received');
      }
      
      // 🟢 FIX: Use correct property name
      await getOTPEndpoint(regData.id || regData.userId);
      
      const tempData = {
        // 🟢 FIX: Use correct property names
        userId: regData.id || regData.userId,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
      };
      
      saveTempRegister(tempData);
      queryClient.setQueryData(authKeys.tempRegister(), tempData);
      
      return tempData;
    } catch (error) {
      saveTempRegister(null);
      queryClient.removeQueries({ queryKey: authKeys.tempRegister() });
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