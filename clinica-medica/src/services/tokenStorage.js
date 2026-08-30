const TOKEN_KEY = 'clinica-medica:token';
const USER_KEY = 'clinica-medica:user';

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export const tokenStorage = {
  getToken() {
    if (!canUseStorage()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    if (!canUseStorage()) return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  getUser() {
    if (!canUseStorage()) return null;

    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  },

  setUser(user) {
    if (!canUseStorage()) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    if (!canUseStorage()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
