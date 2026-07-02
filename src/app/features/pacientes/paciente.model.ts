export interface PacienteResumo {
  guid: string;
  nome: string;
  cpf: string;
  telefone: string;
  quantidadeProcedimentos: number;
}

export interface PacienteConvenio {
    convenioGuid: string;
    codigoBeneficiario: string;
}

export interface PacienteConvenioDetalhes extends PacienteConvenio {
    convenioNome: string;
}

export interface PacienteDetalhes {
    guid: string;
    nome: string;
    cpf: string;
    telefone?: string | null;
    dataNascimento?: Date | null;
    logradouro?: string | null;
    quantidadeProcedimentos: number;
    convenios: PacienteConvenioDetalhes[];
}

export interface PacienteCadastro {
    nome: string;
    cpf: string;
    telefone?: string | null;
    dataNascimento?: Date | null;
    logradouro?: string | null;
    convenios?: PacienteConvenio[];
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
