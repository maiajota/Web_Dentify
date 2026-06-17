export interface PacienteResumo {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  quantidadeProcedimentos: number;
}

export interface PacienteDetalhes {
    id: number;
    nome: string;
    cpf: string;
    telefone?: string | null;
    dataNascimento?: Date | null;
    logradouro?: string | null;
    quantidadeProcedimentos: number;
}

export interface PacienteCadastro {
    nome: string;
    cpf: string;
    telefone?: string | null;
    dataNascimento?: Date | null;
    logradouro?: string | null;
}

export interface PacienteAtualizar {
    id: number;
    nome: string;
    telefone?: string | null;
    dataNascimento?: Date | null;
    logradouro?: string | null;
}

export interface PacienteRequest {
    termo?: string;
    pageNumber: number;
    pageSize: number;
}
