import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../core/api-routes';
import { Paciente } from './paciente.model';

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private http = inject(HttpClient);

  buscar() {
    return this.http.get<Paciente[]>(API_ROUTES.pacientes.buscar);
  }

  buscarPorId(id: number) {
    return this.http.get<Paciente>(API_ROUTES.pacientes.buscarPorId(id));
  }

  adicionar(paciente: Omit<Paciente, 'id'>) {
    return this.http.post<Paciente>(API_ROUTES.pacientes.adicionar, paciente);
  }

  atualizar(id: number, paciente: Partial<Omit<Paciente, 'id'>>) {
    return this.http.put<Paciente>(API_ROUTES.pacientes.atualizar(id), paciente);
  }

  remover(id: number) {
    return this.http.delete<void>(API_ROUTES.pacientes.remover(id));
  }
}
