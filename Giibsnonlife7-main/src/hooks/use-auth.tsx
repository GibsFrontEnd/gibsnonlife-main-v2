// src/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { decryptData } from '@/utils/encrypt-utils';
import { setShowAuthError, logout } from '@/features/reducers/authReducers/authSlice';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  token: string | null;
  showAuthError: boolean;
}

interface SessionConfig {
  timeoutMinutes?: number;
  warningMinutes?: number;
  checkInterval?: number; // in milliseconds
}

// For 10 minutes timeout, 1 minute warning (60 seconds before timeout)
const DEFAULT_CONFIG: Required<SessionConfig> = {
  timeoutMinutes: 10,          // 10 minutes
  warningMinutes: 1,           // 1 minute warning before timeout
  checkInterval: 1000,         // Check every second
};

export const useAuth = (config: SessionConfig = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Merge config with defaults
  const sessionConfig = { ...DEFAULT_CONFIG, ...config };
  
  const auth = useSelector((state: any) => state.auth) as AuthState;
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  // Session timeout timer reference
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const activityRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug log to track session times
  useEffect(() => {
    console.log('Session config:', {
      timeoutMinutes: sessionConfig.timeoutMinutes,
      warningMinutes: sessionConfig.warningMinutes,
      timeoutMs: sessionConfig.timeoutMinutes * 60 * 1000,
      warningMs: sessionConfig.warningMinutes * 60 * 1000,
      checkInterval: sessionConfig.checkInterval
    });
  }, [sessionConfig]);
  
  // Update last activity on user interaction
  const updateLastActivity = useCallback(() => {
    const now = Date.now();
    console.log('Activity detected - updating last activity from', 
      new Date(lastActivity).toLocaleTimeString(), 
      'to', 
      new Date(now).toLocaleTimeString()
    );
    setLastActivity(now);
    localStorage.setItem('lastActivity', now.toString());
  }, [lastActivity]);
  
  // Setup activity listeners
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];
    
    const handleActivity = () => {
      updateLastActivity();
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [updateLastActivity]);
  
  // Check if token exists in localStorage
  const hasToken = useCallback((): boolean => {
    const encryptedToken = localStorage.getItem('token');
    if (!encryptedToken) return false;
    
    try {
      const token = decryptData(encryptedToken);
      return !!token && token.trim() !== '';
    } catch (error) {
      console.error('Error decrypting token:', error);
      return false;
    }
  }, []);
  
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
  
  // Check if session is expired based on last activity
  const isSessionExpired = useCallback((): boolean => {
    if (!hasToken()) {
      console.log('No token found - session expired');
      return true;
    }
    
    const timeSinceLastActivity = Date.now() - lastActivity;
    const timeoutMs = sessionConfig.timeoutMinutes * 60 * 1000;
    const isExpired = timeSinceLastActivity > timeoutMs;
    
    console.log('Session expired check:', {
      timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000) + 's',
      timeoutMs: timeoutMs / 1000 + 's',
      isExpired,
      lastActivity: new Date(lastActivity).toLocaleTimeString()
    });
    
    return isExpired;
  }, [lastActivity, sessionConfig.timeoutMinutes, hasToken]);
  
  // Calculate time remaining until session expires
  const calculateTimeRemaining = useCallback((): number => {
    const timeoutMs = sessionConfig.timeoutMinutes * 60 * 1000;
    const timeSinceLastActivity = Date.now() - lastActivity;
    const remaining = Math.max(0, timeoutMs - timeSinceLastActivity);
    
    return remaining;
  }, [lastActivity, sessionConfig.timeoutMinutes]);
  
  // Handle session timeout
  const handleSessionTimeout = useCallback(() => {
    console.log('Session timeout triggered - logging out...');
    
    // Clear all timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Perform logout
    logoutUser();
  }, []);
  
  // Show timeout warning
  const showWarning = useCallback(() => {
    console.log('Showing timeout warning');
    setShowTimeoutWarning(true);
    
    // Start updating time remaining more frequently for display
    const warningInterval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      const seconds = Math.ceil(remaining / 1000);
      setTimeRemaining(seconds);
      
      if (seconds <= 0) {
        clearInterval(warningInterval);
      }
    }, 500); // Update every 500ms for smoother countdown
    
    intervalRef.current = warningInterval;
  }, [calculateTimeRemaining]);
  
  // Reset session timeout
  const resetSessionTimeout = useCallback(() => {
    console.log('Resetting session timeout...');
    
    // Clear existing timeouts and intervals
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset warning state
    setShowTimeoutWarning(false);
    setTimeRemaining(null);
    
    if (!hasToken()) {
      console.log('No token - skipping timeout setup');
      return;
    }
    
    // Calculate times in milliseconds
    const timeoutMs = sessionConfig.timeoutMinutes * 60 * 1000;
    const warningMs = sessionConfig.warningMinutes * 60 * 1000;
    
    console.log('Setting timeouts:', {
      timeoutMinutes: sessionConfig.timeoutMinutes,
      warningMinutes: sessionConfig.warningMinutes,
      timeoutMs: `${timeoutMs}ms (${timeoutMs/1000}s)`,
      warningMs: `${warningMs}ms (${warningMs/1000}s)`
    });
    
    // Set warning timeout (shows warning X minutes before timeout)
    // If warningMinutes is 1, warning will show at 9 minutes (10-1)
    const warningTimeoutMs = timeoutMs - warningMs;
    if (warningTimeoutMs > 0) {
      warningRef.current = setTimeout(() => {
        console.log('Warning timeout triggered at', new Date().toLocaleTimeString());
        showWarning();
      }, warningTimeoutMs);
    }
    
    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Logout timeout triggered at', new Date().toLocaleTimeString());
      handleSessionTimeout();
    }, timeoutMs);
    
    // Update remaining time display periodically (in seconds)
    const updateInterval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      const seconds = Math.ceil(remaining / 1000);
      setTimeRemaining(seconds);
    }, 1000);
    
    intervalRef.current = updateInterval;
    
    console.log('Session timeout reset. Next warning in', 
      Math.round(warningTimeoutMs / 1000), 'seconds,',
      'logout in', Math.round(timeoutMs / 1000), 'seconds'
    );
    
    // Return cleanup function
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
    };
  }, [
    sessionConfig.timeoutMinutes,
    sessionConfig.warningMinutes,
    hasToken,
    showWarning,
    handleSessionTimeout,
    calculateTimeRemaining
  ]);
  
  // Logout function
  const logoutUser = useCallback(() => {
    console.log('Logging out user...');
    
    // Clear all timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (activityRef.current) {
      clearInterval(activityRef.current);
      activityRef.current = null;
    }
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('lastActivity');
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Reset state
    setShowTimeoutWarning(false);
    setTimeRemaining(null);
    
    // Dispatch logout action
    dispatch(logout());
    
    // Navigate to login
    navigate('/login');
  }, [dispatch, navigate]);
  
  // Extend session manually (when user clicks "Stay Signed In")
  const extendSession = useCallback(() => {
    console.log('Extending session...');
    updateLastActivity();
    setShowTimeoutWarning(false);
    resetSessionTimeout();
  }, [updateLastActivity, resetSessionTimeout]);
  
  // Handle auth error from Redux
  useEffect(() => {
    if (auth.showAuthError) {
      console.log('Auth error detected, redirecting to login...');
      
      const timeout = setTimeout(() => {
        logoutUser();
        dispatch(setShowAuthError(false));
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [auth.showAuthError, dispatch, logoutUser]);
  
  // Initialize session timeout on mount and when auth state changes
  useEffect(() => {
    console.log('Initializing session timeout...');
    
    if (hasToken()) {
      // Restore last activity from localStorage if available
      const savedLastActivity = localStorage.getItem('lastActivity');
      if (savedLastActivity) {
        const parsedTime = parseInt(savedLastActivity, 10);
        if (!isNaN(parsedTime)) {
          setLastActivity(parsedTime);
          console.log('Restored last activity from storage:', 
            new Date(parsedTime).toLocaleTimeString()
          );
        } else {
          console.log('Invalid saved activity, using current time');
          setLastActivity(Date.now());
        }
      } else {
        console.log('No saved activity found, using current time');
        setLastActivity(Date.now());
      }
      
      // Start session timeout tracking
      resetSessionTimeout();
      
      // Save last activity periodically
      activityRef.current = setInterval(() => {
        localStorage.setItem('lastActivity', Date.now().toString());
      }, 30000); // Save every 30 seconds
      
      return () => {
        console.log('Cleaning up session timeout...');
        // Don't clear timeouts on cleanup, let them run
        if (activityRef.current) {
          clearInterval(activityRef.current);
          activityRef.current = null;
        }
      };
    } else {
      console.log('No token - not setting up session timeout');
      // Clear any existing timeouts if no token
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [auth.isAuthenticated, resetSessionTimeout, hasToken]);
  
  // Effect to handle session expiration check
  useEffect(() => {
    if (hasToken() && isSessionExpired()) {
      console.log('Session expired during idle time, logging out...');
      logoutUser();
    }
  }, [hasToken, isSessionExpired, logoutUser]);
  
  return {
    isAuthenticated: auth.isAuthenticated || hasToken(),
    user: auth.user,
    token: getToken(),
    showAuthError: auth.showAuthError,
    showTimeoutWarning,
    timeRemaining,
    hasToken,
    getToken,
    logout: logoutUser,
    extendSession,
    updateLastActivity,
    isSessionExpired,
  };
};

// Hook to protect routes that require authentication with session timeout
export const useRequireAuth = (redirectUrl = '/login') => {
  const { 
    isAuthenticated, 
    hasToken, 
    isSessionExpired,
    showTimeoutWarning,
    extendSession,
    logout 
  } = useAuth();
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  
  useEffect(() => {
    const checkAuth = () => {
      if (!isAuthenticated && !hasToken()) {
        console.log('No authentication, redirecting to login');
        navigate(redirectUrl);
        return;
      }
      
      if (isSessionExpired()) {
        console.log('Session expired, logging out...');
        logout();
        return;
      }
      
      setCheckingSession(false);
    };
    
    checkAuth();
  }, [isAuthenticated, hasToken, isSessionExpired, navigate, redirectUrl, logout]);
  
  return {
    isAuthenticated: isAuthenticated || hasToken(),
    checkingSession,
    showTimeoutWarning,
    extendSession,
  };
};

// Hook to show session timeout warning modal
export const useSessionTimeoutModal = () => {
  const { showTimeoutWarning, timeRemaining, extendSession, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    setIsOpen(showTimeoutWarning);
  }, [showTimeoutWarning]);
  
  const handleStaySignedIn = () => {
    extendSession();
    setIsOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };
  
  return {
    isOpen,
    timeRemaining,
    handleStaySignedIn,
    handleLogout,
  };
};