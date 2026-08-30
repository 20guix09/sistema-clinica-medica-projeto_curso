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
    return shouldUseMocks()
      ? mockCrudService.restore(resource, payload)
      : apiRequest(ENDPOINTS.pacientes.base, { method: 'POST', body: payload });
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
