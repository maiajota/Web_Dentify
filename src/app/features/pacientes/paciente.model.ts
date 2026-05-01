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
    telefone: string;
    dataNascimento: Date;
    logradouro: string;
    quantidadeProcedimentos: number;
}

export interface PacienteCadastro {
    nome: string;
    cpf: string;
    telefone: string;
    dataNascimento: Date;
    logradouro: string;
}

export interface PacienteAtualizar {
    id: number;
    nome: string;
    telefone: string;
    dataNascimento: Date;
    logradouro: string;
}
