import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_ROUTES } from '../../core/api-routes';
import { PagedResult } from '../../core/models/paged-result.model';
import {
    PacienteAtualizar,
    PacienteCadastro,
    PacienteConvenio,
    PacienteDetalhes,
    PacienteRequest,
    PacienteResumo,
} from './paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
    private http = inject(HttpClient);

    buscar(request?: PacienteRequest) {
        let params = new HttpParams();
        if (request) {
            if (request.termo) params = params.set('termo', request.termo);
            params = params.set('pageNumber', request.pageNumber.toString());
            params = params.set('pageSize', request.pageSize.toString());
        }
        return this.http.get<PagedResult<PacienteResumo>>(API_ROUTES.pacientes.buscar, { params });
    }

    buscarPorId(id: string) {
        return this.http.get<PacienteDetalhes>(API_ROUTES.pacientes.buscarPorId(id));
    }

    adicionar(paciente: PacienteCadastro) {
        return this.http.post<{ guid: string }>(API_ROUTES.pacientes.adicionar, paciente);
    }

    atualizar(guid: string, paciente: Partial<Omit<PacienteAtualizar, 'guid'>>) {
        return this.http.patch<PacienteAtualizar>(API_ROUTES.pacientes.atualizar(guid), paciente);
    }

    atualizarConvenios(guid: string, convenios: PacienteConvenio[]) {
        return this.http.patch<void>(API_ROUTES.pacientes.atualizarConvenios(guid), convenios);
    }

    remover(id: string) {
        return this.http.delete<void>(API_ROUTES.pacientes.remover(id));
    }

}
