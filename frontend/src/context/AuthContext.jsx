import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('slv_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('slv_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Auto-login with default admin if nothing stored for seamless testing
  useEffect(() => {
    if (!token) {
      loginAs('admin').finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('slv_token', data.token);
    localStorage.setItem('slv_user', JSON.stringify(data.user));
    return data.user;
  };

  const loginAs = async (roleName) => {
    const passwordMap = {
      admin: 'admin123',
      treasurer: 'treasurer123',
      secretary: 'secretary123',
      member: 'member123'
    };
    return login(roleName, passwordMap[roleName] || 'admin123');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('slv_token');
    localStorage.removeItem('slv_user');
  };

  const authFetch = (url, options = {}) => {
    const headers = {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : ''
    };
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        loginAs,
        logout,
        authFetch,
        hasRole: (...roles) => {
          if (!user) return false;
          if (user.role === 'admin') return true;
          return roles.includes(user.role);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
