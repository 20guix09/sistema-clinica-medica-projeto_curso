// comunicação deste recurso com a API

const TOKEN_KEY = 'clinica-medica:token';
const USER_KEY = 'clinica-medica:user';

// função para can use storage
function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}


function tokenValido(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Number.isFinite(payload.exp) && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const tokenStorage = {
  getToken() {
    if (!canUseStorage()) return null;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!tokenValido(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return token;
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
