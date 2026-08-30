import { apiRequest, shouldUseMocks } from './api.js';
import { ENDPOINTS } from './endpoints.js';
import { mockCrudService } from '../mocks/mockCrudService.js';

const resource = 'especialidades';

export const especialidadesService = {
  list(params = {}) {
    return shouldUseMocks()
      ? mockCrudService.list(resource, params)
      : apiRequest(ENDPOINTS.especialidades.base);
  },

  getById(id) {
    return shouldUseMocks()
      ? mockCrudService.getById(resource, id)
      : apiRequest(ENDPOINTS.especialidades.byId(id));
  },

  create(payload) {
    return shouldUseMocks()
      ? mockCrudService.create(resource, payload)
      : apiRequest(ENDPOINTS.especialidades.base, { method: 'POST', body: payload });
  },

  restore(payload) {
    return shouldUseMocks()
      ? mockCrudService.restore(resource, payload)
      : apiRequest(ENDPOINTS.especialidades.base, { method: 'POST', body: payload });
  },

  update(id, payload) {
    return shouldUseMocks()
      ? mockCrudService.update(resource, id, payload)
      : apiRequest(ENDPOINTS.especialidades.byId(id), { method: 'PUT', body: payload });
  },

  remove(id) {
    return shouldUseMocks()
      ? mockCrudService.remove(resource, id)
      : apiRequest(ENDPOINTS.especialidades.byId(id), { method: 'DELETE' });
  },
};
