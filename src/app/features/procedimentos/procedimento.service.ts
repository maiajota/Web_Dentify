import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ROUTES } from '../../core/api-routes';
import { PagedResult } from '../../core/models/paged-result.model';
import { Procedimento, ProcedimentoAtualizacao, ProcedimentoCadastro, ProcedimentoRequest } from './procedimento.model';

@Injectable({ providedIn: 'root' })
export class ProcedimentoService {
    private http = inject(HttpClient);

    buscarPorPaciente(pacienteId: string, request?: ProcedimentoRequest) {
        let params = new HttpParams();
        if (request) {
            if (request.descricao) params = params.set('descricao', request.descricao);

            request.convenioGuids?.forEach((guid) => (params = params.append('convenioGuids', guid)));

            if (request.dataInicio) params = params.set('dataInicio', request.dataInicio);
            if (request.dataFim) params = params.set('dataFim', request.dataFim);

            params = params.set('pageNumber', request.pageNumber.toString());
            params = params.set('pageSize', request.pageSize.toString());
        }
        return this.http.get<PagedResult<Procedimento>>(API_ROUTES.procedimentos.buscarPorId(pacienteId), { params });
    }

    buscarRecentesPorPaciente(pacienteId: string, quantidade: number) {
        return this.http.get<Procedimento[]>(API_ROUTES.procedimentos.buscarRecentes(pacienteId, quantidade));
    }

    adicionar(procedimento: ProcedimentoCadastro) {
        return this.http.post<void>(API_ROUTES.procedimentos.adicionar, procedimento);
    }

    atualizar(id: string, procedimento: ProcedimentoAtualizacao) {
        return this.http.patch<void>(API_ROUTES.procedimentos.atualizar(id), procedimento);
    }

    remover(id: string) {
        return this.http.delete<void>(API_ROUTES.procedimentos.remover(id));
    }
}
