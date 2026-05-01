import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../core/api-routes';
import { Procedimento } from './procedimento.model';

@Injectable({ providedIn: 'root' })
export class ProcedimentoService {
    private http = inject(HttpClient);

    buscarPorPaciente(pacienteId: number) {
        return this.http.get<Procedimento[]>(API_ROUTES.procedimentos.buscarPorId(pacienteId));
    }

    buscarRecentesPorPaciente(pacienteId: number, quantidade: number) {
        return this.http.get<Procedimento[]>(API_ROUTES.procedimentos.buscarRecentes(pacienteId, quantidade));
    }
}
