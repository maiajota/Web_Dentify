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

export interface ProcedimentoRequest {
    descricao?: string;
    convenioIds?: number[];
    dataInicio?: string;
    dataFim?: string;
    pageNumber: number;
    pageSize: number;
}
