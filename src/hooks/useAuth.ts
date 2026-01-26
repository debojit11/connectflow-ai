import { useState, useEffect, useCallback } from "react";

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

const TOKEN_KEY = "auth_token";
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
      // TODO: Replace with actual API call
      // const response = await fetch("/auth/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: credentials.email,
      //     password: credentials.password,
      //   }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (!credentials.email || !credentials.password) {
        return { success: false, error: "Email and password are required" };
      }

      // Mock successful login
      const mockToken = `token_${Date.now()}`;
      const mockUser = { email: credentials.email };

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      if (credentials.rememberMe) {
        localStorage.setItem(REMEMBER_KEY, "true");
      }

      setAuthState({
        user: mockUser,
        token: mockToken,
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
      // TODO: Replace with actual API call
      // const response = await fetch("/auth/signup", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: credentials.email,
      //     password: credentials.password,
      //   }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (!credentials.email || !credentials.password) {
        return { success: false, error: "Email and password are required" };
      }

      if (credentials.password.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
      }

      // Auto-login after signup
      return login({ email: credentials.email, password: credentials.password });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Signup failed" 
      };
    }
  }, [login]);

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
