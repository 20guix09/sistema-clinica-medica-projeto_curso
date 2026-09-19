// comunicação deste recurso com a API

import { tokenStorage } from './tokenStorage.js';

const DEFAULT_TIMEOUT = 12000;

export const API_CONFIG = {
  baseUrl: (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, ''),
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
};

export class ApiError extends Error {
  constructor(message, { status = 500, data = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// função para should use mocks
export function shouldUseMocks() {
  return API_CONFIG.useMocks;
}

// função para api request
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
  const abortFromExternal = () => controller.abort(signal?.reason);
  if (signal?.aborted) abortFromExternal();
  else signal?.addEventListener('abort', abortFromExternal, { once: true });
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const requestSignal = controller.signal;
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

    if (response.status === 401 && auth) {
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent('medagenda:unauthorized'));
    }

    if (!response.ok) {
      const message =
        data?.erro ??
        data?.mensagem ??
        data?.message ??
        (Array.isArray(data?.erros) ? data.erros.join(', ') : null) ??
        (typeof data === 'string' && data.trim() ? data : null) ??
        `Erro na requisição (${response.status}).`;

      throw new ApiError(message, {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      if (signal?.aborted) throw new ApiError('A requisição foi cancelada.', { status: 499 });
      throw new ApiError('A requisição demorou mais que o esperado.', { status: 408 });
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Não foi possível conectar ao servidor.', {
      status: 0,
      data: error,
    });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromExternal);
  }
}

// função para parse response
async function parseResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  return response.text();
}
