import { environment } from '../../environments/environment';

const BASE = environment.apiUrl;

export const API_ROUTES = {
    auth: {
        login: `${BASE}/api/Autenticacao/login`,
        logout: `${BASE}/api/Autenticacao/logout`,
        cadastro: `${BASE}/api/Autenticacao/cadastro`,
    },
    usuario: {
        cadastro: `${BASE}/api/Usuario/adicionar`,
    },
    pacientes: {
        buscar: `${BASE}/api/Paciente/buscar`,
        buscarPorId: (id: number) => `${BASE}/api/Paciente/buscar/${id}`,
        adicionar: `${BASE}/api/Paciente/adicionar`,
        atualizar: (id: number) => `${BASE}/api/Paciente/atualizar/${id}`,
        remover: (id: number) => `${BASE}/api/Paciente/remover/${id}`,
    },
    procedimentos: {
        buscarPorId: (pacienteId: number) => `${BASE}/api/Procedimento/buscarTodos/${pacienteId}`,
        buscarRecentes: (pacienteId: number, quantidade: number) => `${BASE}/api/Procedimento/buscarRecentes/${pacienteId}?quantidade=${quantidade}`,
        adicionar: `${BASE}/api/Procedimento/adicionar`,
        atualizar: (id: number) => `${BASE}/api/Procedimento/atualizar/${id}`,
        remover: (id: number) => `${BASE}/api/Procedimento/remover/${id}`,
    },
    convenios: {
        buscar: `${BASE}/api/Convenio/buscar`,
    }
};
