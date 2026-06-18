export interface Procedimento {
    guid: string;
    descricao: string;
    convenioNome: string;
    convenioGuid: string | null;
    dataProcedimento: Date;
}

export interface ProcedimentoCadastro {
    dataProcedimento: Date;
    descricao: string;
    convenioGuid: string | null;
    pacienteGuid: string;
}

export interface ProcedimentoAtualizacao {
    dataProcedimento: Date;
    descricao: string;
    convenioGuid: string | null;
}

export interface ProcedimentoRequest {
    descricao?: string;
    convenioGuids?: string[];
    dataInicio?: string;
    dataFim?: string;
    pageNumber: number;
    pageSize: number;
}
