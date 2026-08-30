import { mockCrudService } from './mockCrudService.js';

export const mockConsultasService = {
  setStatus(id, status) {
    return mockCrudService.update('consultas', id, { status });
  },

  cancelar(id, motivoCancelamento) {
    return mockCrudService.update('consultas', id, {
      status: 'Cancelada',
      motivoCancelamento,
    });
  },
};
