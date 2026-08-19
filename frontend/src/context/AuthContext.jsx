import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setSessionExpiredHandler } from '../api/client.js';
import { authApi } from '../api/endpoints.js';
import { clearSession, readSession, writeSession } from '../api/session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession()?.user || null);

  const signOut = useCallback(async () => {
    const session = readSession();
    if (session?.refreshToken) {
      // Revoke server side, but never block the UI on it.
      authApi.logout(session.refreshToken).catch(() => {});
    }
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
  }, []);

  const applySession = (session) => {
    writeSession(session);
    setUser(session.user);
    return session.user;
  };

  const value = useMemo(
    () => ({
      user,
      isAdmin: user?.role === 'admin',
      isMember: user?.role === 'member',
      signIn: async (credentials) => applySession(await authApi.login(credentials)),
      signUp: async (payload) => applySession(await authApi.register(payload)),
      signOut,
    }),
    [user, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
}
