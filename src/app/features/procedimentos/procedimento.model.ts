export interface Procedimento {
    id: number;
    descricao: string;
    convenioNome: string;
    convenioId: number
    dataProcedimento: Date;
}

export interface ProcedimentoCadastro {
    dataProcedimento: Date;
    descricao: string;
    convenioId: number | null;
    pacienteId: number;
}

export interface ProcedimentoAtualizacao {
    dataProcedimento: Date;
    descricao: string;
    convenioId: number | null;
}
