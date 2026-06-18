export interface PacienteResumo {
  guid: string;
  nome: string;
  cpf: string;
  telefone: string;
  quantidadeProcedimentos: number;
}

export interface PacienteDetalhes {
    guid: string;
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
    guid: string;
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
