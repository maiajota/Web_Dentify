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
        buscarPorId: (id: string) => `${BASE}/api/Paciente/buscar/${id}`,
        adicionar: `${BASE}/api/Paciente/adicionar`,
        atualizar: (id: string) => `${BASE}/api/Paciente/atualizar/${id}`,
        atualizarConvenios: (id: string) => `${BASE}/api/Paciente/atualizar/${id}/convenios`,
        remover: (id: string) => `${BASE}/api/Paciente/remover/${id}`,
    },
    procedimentos: {
        buscarPorId: (pacienteId: string) => `${BASE}/api/Procedimento/buscarTodos/${pacienteId}`,
        buscarRecentes: (pacienteId: string, quantidade: number) => `${BASE}/api/Procedimento/buscarRecentes/${pacienteId}?quantidade=${quantidade}`,
        adicionar: `${BASE}/api/Procedimento/adicionar`,
        atualizar: (id: string) => `${BASE}/api/Procedimento/atualizar/${id}`,
        remover: (id: string) => `${BASE}/api/Procedimento/remover/${id}`,
    },
    convenios: {
        buscar: `${BASE}/api/Convenio/buscar`,
    }
};
