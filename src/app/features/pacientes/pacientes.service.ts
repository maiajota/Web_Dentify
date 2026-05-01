import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../core/api-routes';
import {
    PacienteAtualizar,
    PacienteCadastro,
    PacienteDetalhes,
    PacienteResumo,
} from './paciente.model';

@Injectable({ providedIn: 'root' })
export class PacientesService {
    private http = inject(HttpClient);

    buscar() {
        return this.http.get<PacienteResumo[]>(API_ROUTES.pacientes.buscar);
    }

    buscarPorId(id: number) {
        return this.http.get<PacienteDetalhes>(API_ROUTES.pacientes.buscarPorId(id));
    }

    adicionar(paciente: Omit<PacienteCadastro, 'id'>) {
        return this.http.post<PacienteCadastro>(API_ROUTES.pacientes.adicionar, paciente);
    }

    atualizar(id: number, paciente: Partial<Omit<PacienteAtualizar, 'id'>>) {
        return this.http.put<PacienteAtualizar>(API_ROUTES.pacientes.atualizar(id), paciente);
    }

    remover(id: number) {
        return this.http.delete<void>(API_ROUTES.pacientes.remover(id));
    }
}
