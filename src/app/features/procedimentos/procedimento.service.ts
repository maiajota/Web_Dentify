import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ROUTES } from '../../core/api-routes';
import { Procedimento, ProcedimentoAtualizacao, ProcedimentoCadastro } from './procedimento.model';

@Injectable({ providedIn: 'root' })
export class ProcedimentoService {
    private http = inject(HttpClient);

    buscarPorPaciente(pacienteId: number, params?: HttpParams) {
        return this.http.get<Procedimento[]>(API_ROUTES.procedimentos.buscarPorId(pacienteId), { params });
    }

    buscarRecentesPorPaciente(pacienteId: number, quantidade: number) {
        return this.http.get<Procedimento[]>(API_ROUTES.procedimentos.buscarRecentes(pacienteId, quantidade));
    }

    adicionar(procedimento: ProcedimentoCadastro) {
        return this.http.post<void>(API_ROUTES.procedimentos.adicionar, procedimento);
    }

    atualizar(id: number, procedimento: ProcedimentoAtualizacao) {
        return this.http.patch<void>(API_ROUTES.procedimentos.atualizar(id), procedimento);
    }

    remover(id: number) {
        return this.http.delete<void>(API_ROUTES.procedimentos.remover(id));
    }
}
