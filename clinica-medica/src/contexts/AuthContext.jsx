import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => authService.getToken());
  const isAuthenticated = Boolean(token);

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials);
    setUser(session.user);
    setToken(session.token);
    return session;
  }, []);

  const cadastro = useCallback(async (payload) => {
    const result = await authService.cadastro(payload);
    return result;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      cadastro,
      isAuthenticated,
      login,
      logout,
      token,
      user,
    }),
    [cadastro, isAuthenticated, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
