import { environment } from '../../environments/environment';

const BASE = environment.apiUrl;

export const API_ROUTES = {
  auth: {
    login: `${BASE}/api/Autenticacao/login`,
    logout: `${BASE}/api/Autenticacao/logout`,
  },
  pacientes: {
    buscar: `${BASE}/api/Paciente/buscar`,
    buscarPorId: (id: number) => `${BASE}/api/Paciente/buscar/${id}`,
    adicionar: `${BASE}/api/Paciente/adicionar`,
    atualizar: (id: number) => `${BASE}/api/Paciente/atualizar/${id}`,
    remover: (id: number) => `${BASE}/api/Paciente/remover/${id}`,
  },
};
