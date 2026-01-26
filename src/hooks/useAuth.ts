import { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";

interface User {
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface SignupCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  error?: string;
}

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";
const REMEMBER_KEY = "auth_remember";

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        clearAuth();
      }
    } else if (token) {
      // Token exists but no user data
      setAuthState({
        user: null,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authApi.login(credentials.email, credentials.password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (!response.data?.access_token) {
        return { success: false, error: "No access token received" };
      }

      const token = response.data.access_token;
      const user = { email: credentials.email };

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      
      if (credentials.rememberMe) {
        localStorage.setItem(REMEMBER_KEY, "true");
      }

      setAuthState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      };
    }
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
      if (!credentials.email || !credentials.password) {
        return { success: false, error: "Email and password are required" };
      }

      if (credentials.password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
      }

      const response = await authApi.signup(credentials.email, credentials.password);

      if (response.error) {
        return { success: false, error: response.error };
      }

      // On successful signup, return success (user should be redirected to login)
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Signup failed" 
      };
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const getAuthHeader = useCallback(() => {
    return authState.token ? { Authorization: `Bearer ${authState.token}` } : {};
  }, [authState.token]);

  return {
    ...authState,
    login,
    signup,
    logout,
    getAuthHeader,
  };
}
