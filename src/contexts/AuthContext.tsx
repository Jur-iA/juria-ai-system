import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  oabNumber: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, oabNumber: string) => Promise<void>;
  isDemo: boolean;
  demoExpiresAt?: number; // epoch ms
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoExpiresAt, setDemoExpiresAt] = useState<number | undefined>(undefined);

  // Helper to restore session from existing token
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('user_email');
    const id = localStorage.getItem('user_id');
    if (token && email && id) {
      setUser({ id, name: email.split('@')[0], email, oabNumber: '' });
      setIsAuthenticated(true);
      // restore demo info
      const expStr = localStorage.getItem('demo_expires_at');
      const demoFlag = localStorage.getItem('is_demo') === 'true';
      if (expStr) {
        const expNum = parseInt(expStr, 10);
        if (!Number.isNaN(expNum)) setDemoExpiresAt(expNum);
      } else {
        // try decode JWT to get exp
        try {
          const payload = JSON.parse(atob(token.split('.')[1] || ''));
          if (payload?.exp) setDemoExpiresAt(payload.exp * 1000);
        } catch {}
      }
      setIsDemo(demoFlag || (email === (import.meta as any).env?.VITE_DEMO_EMAIL));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Authenticate against backend and store JWT
    const base = (import.meta as any).env?.VITE_API_BASE_URL || 'https://juria-ai-project.onrender.com';
    const res = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok || !data?.token) {
      throw new Error(data?.error || 'Falha no login');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user_email', data.user?.email || email);
    localStorage.setItem('user_id', data.user?.id || email);
    // decode exp for demo countdown
    let expMs: number | undefined = undefined;
    try {
      const payload = JSON.parse(atob((data.token as string).split('.')[1] || ''));
      if (payload?.exp) expMs = payload.exp * 1000;
    } catch {}
    const demo = Boolean(data.demo) || (data.user?.email === (import.meta as any).env?.VITE_DEMO_EMAIL);
    setIsDemo(demo);
    setDemoExpiresAt(expMs);
    localStorage.setItem('is_demo', String(demo));
    if (expMs) localStorage.setItem('demo_expires_at', String(expMs)); else localStorage.removeItem('demo_expires_at');
    const logged: User = {
      id: data.user?.id || email,
      name: (data.user?.email || email).split('@')[0],
      email: data.user?.email || email,
      oabNumber: ''
    };
    setUser(logged);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear auth
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('is_demo');
    localStorage.removeItem('demo_expires_at');
    setUser(null);
    setIsAuthenticated(false);
    setIsDemo(false);
    setDemoExpiresAt(undefined);
  };

  const register = async (name: string, email: string, password: string, oabNumber: string) => {
    // Placeholder local registration (frontend only). Backend auth is email-based demo for agora.
    const existing = localStorage.getItem('auth_users');
    const users: any[] = existing ? JSON.parse(existing) : [];
    if (users.some(u => u.email === email)) {
      throw new Error('E-mail já cadastrado');
    }
    const newUsers = [{ name, email, password, oabNumber }, ...users];
    localStorage.setItem('auth_users', JSON.stringify(newUsers));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register, isDemo, demoExpiresAt }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}