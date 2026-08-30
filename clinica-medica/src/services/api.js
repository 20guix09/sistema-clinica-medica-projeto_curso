import { tokenStorage } from './tokenStorage.js';

const DEFAULT_TIMEOUT = 12000;

export const API_CONFIG = {
  baseUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''),
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
};

export class ApiError extends Error {
  constructor(message, { status = 500, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function shouldUseMocks() {
  return API_CONFIG.useMocks;
}

export async function apiRequest(endpoint, options = {}) {
  const {
    auth = true,
    body,
    headers = {},
    method = 'GET',
    signal,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  if (!API_CONFIG.baseUrl) {
    throw new ApiError('VITE_API_URL não foi configurada.', { status: 0 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const requestSignal = signal ?? controller.signal;
  const token = tokenStorage.getToken();

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
      method,
      signal: requestSignal,
      headers: {
        Accept: 'application/json',
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body instanceof FormData || body === undefined ? body : JSON.stringify(body),
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      throw new ApiError(data?.mensagem || data?.message || 'Erro na requisicao.', {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('A requisicao demorou mais que o esperado.', { status: 408 });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Não foi possível conectar ao servidor.', { status: 0, data: error });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}
