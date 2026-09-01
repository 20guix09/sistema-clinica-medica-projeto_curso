import { apiRequest, shouldUseMocks } from './api.js';
import { ENDPOINTS } from './endpoints.js';
import { mockCrudService } from '../mocks/mockCrudService.js';

const resource = 'pacientes';

export const pacientesService = {
  list(params = {}) {
    return shouldUseMocks()
      ? mockCrudService.list(resource, params)
      : apiRequest(ENDPOINTS.pacientes.base);
  },

  getById(id) {
    return shouldUseMocks()
      ? mockCrudService.getById(resource, id)
      : apiRequest(ENDPOINTS.pacientes.byId(id));
  },

  create(payload) {
    return shouldUseMocks()
      ? mockCrudService.create(resource, payload)
      : apiRequest(ENDPOINTS.pacientes.base, { method: 'POST', body: payload });
  },

  restore(payload) {
    if (shouldUseMocks()) {
      return mockCrudService.restore(resource, payload);
    }

    const restorePayload = {
      nome: payload.nome,
      cpf: payload.cpf,
      nasc: payload.data_nascimento ?? payload.nasc,
      sexo: payload.sexo ?? null,
      tel: payload.telefone ?? payload.tel,
      email: payload.email,
      cep: payload.cep ?? null,
      rua: payload.rua ?? null,
      num: payload.numero ?? payload.num ?? null,
      comp: payload.complemento ?? payload.comp ?? null,
      bairro: payload.bairro ?? null,
      cid: payload.cidade ?? payload.cid ?? null,
      est: payload.estado ?? payload.est ?? null,
    };

    return apiRequest(ENDPOINTS.pacientes.base, {
      method: 'POST',
      body: restorePayload,
    });
  },

  update(id, payload) {
    return shouldUseMocks()
      ? mockCrudService.update(resource, id, payload)
      : apiRequest(ENDPOINTS.pacientes.byId(id), { method: 'PUT', body: payload });
  },

  remove(id) {
    return shouldUseMocks()
      ? mockCrudService.remove(resource, id)
      : apiRequest(ENDPOINTS.pacientes.byId(id), { method: 'DELETE' });
  },
};
