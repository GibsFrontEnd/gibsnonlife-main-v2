// src/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { decryptData } from '@/utils/encrypt-utils';
import { setShowAuthError } from '@/features/reducers/authReducers/authSlice';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  showAuthError: boolean;
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state from Redux - adjust selector based on your Redux structure
  const auth = useSelector((state: any) => state.auth) as AuthState;
  
  // Check if token exists in localStorage
  const hasToken = (): boolean => {
    const encryptedToken = localStorage.getItem('token');
    if (!encryptedToken) return false;
    
    try {
      const token = decryptData(encryptedToken);
      return !!token;
    } catch (error) {
      console.error('Error decrypting token:', error);
      return false;
    }
  };
  
  // Get decrypted token
  const getToken = (): string | null => {
    const encryptedToken = localStorage.getItem('token');
    if (!encryptedToken) return null;
    
    try {
      return decryptData(encryptedToken);
    } catch (error) {
      console.error('Error decrypting token:', error);
      return null;
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    // Clear any other auth-related storage
    
    // Dispatch logout action if you have one
    // dispatch(logoutAction());
    
    navigate('/login');
  };
  
  // Handle auth error from Redux
  useEffect(() => {
    if (auth.showAuthError) {
      console.log('Auth error detected, redirecting to login...');
      
      // Give user time to see the error before redirect
      const timeout = setTimeout(() => {
        logout();
        // Reset the auth error flag
        dispatch(setShowAuthError(false));
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [auth.showAuthError]);
  
  return {
    isAuthenticated: auth.isAuthenticated || hasToken(),
    user: auth.user,
    token: getToken(),
    showAuthError: auth.showAuthError,
    hasToken,
    getToken,
    logout,
  };
};

// Hook to protect routes that require authentication
export const useRequireAuth = (redirectUrl = '/login') => {
  const { isAuthenticated, hasToken } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated && !hasToken()) {
      navigate(redirectUrl);
    }
  }, [isAuthenticated, hasToken, navigate, redirectUrl]);
  
  return isAuthenticated || hasToken();
};