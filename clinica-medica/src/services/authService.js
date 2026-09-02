import { apiRequest, shouldUseMocks } from './api.js';
import { ENDPOINTS } from './endpoints.js';
import { mockAuthService } from '../mocks/mockAuthService.js';
import { tokenStorage } from './tokenStorage.js';

export const authService = {
  async login(credentials) {
    const session = shouldUseMocks()
      ? await mockAuthService.login(credentials)
      : await apiRequest(ENDPOINTS.auth.login, {
          method: 'POST',
          body: credentials,
          auth: false,
        });

    const normalizedSession = normalizeSession(session, credentials);

    if (!normalizedSession.token) {
      throw new Error('O servidor não retornou um token de acesso.');
    }

    tokenStorage.setToken(normalizedSession.token);
    tokenStorage.setUser(normalizedSession.user);

    return normalizedSession;
  },

  async cadastro(payload) {
    return shouldUseMocks()
      ? mockAuthService.cadastro(payload)
      : apiRequest(ENDPOINTS.auth.cadastro, {
          method: 'POST',
          body: {
            nome: payload.nome,
            email: payload.email,
            senha: payload.senha,
          },
          auth: false,
        });
  },

  logout() {
    tokenStorage.clear();
  },

  getToken() {
    return tokenStorage.getToken();
  },

  getCurrentUser() {
    return tokenStorage.getUser();
  },

  isAuthenticated() {
    return Boolean(tokenStorage.getToken());
  },
};

function normalizeSession(session, credentials) {
  const user = session?.usuario ?? session?.user ?? {
    nome: session?.nome ?? credentials.email.split('@')[0],
    email: credentials.email,
    perfil: 'Administrador',
  };

  return {
    mensagem: session?.mensagem ?? 'Login realizado com sucesso',
    token: session?.token ?? null,
    user: {
      ...user,
      perfil: user.perfil ?? 'Administrador',
    },
  };
}
