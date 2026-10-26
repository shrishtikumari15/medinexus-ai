import React, { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'medinexus_token';
const USER_KEY = 'medinexus_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async ({ email, password, role }) => {
    const { data } = await api.post('/auth/login', { email, password, role });
    const account = data.data;
    localStorage.setItem(TOKEN_KEY, account.token);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
    setUser(account);
    return account;
  }, []);

  const registerUser = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register/user', payload);
    const account = data.data;
    localStorage.setItem(TOKEN_KEY, account.token);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
    setUser(account);
    return account;
  }, []);

  const registerDoctor = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register/doctor', payload);
    const account = data.data;
    localStorage.setItem(TOKEN_KEY, account.token);
    localStorage.setItem(USER_KEY, JSON.stringify(account));
    setUser(account);
    return account;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, registerUser, registerDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
