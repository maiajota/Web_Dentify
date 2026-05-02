import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_ROUTES } from '../../core/api-routes';
import { Convenio } from './convenio.model';

@Injectable({ providedIn: 'root' })
export class ConvenioService {
    private http = inject(HttpClient);

    buscar() {
        return this.http.get<Convenio[]>(API_ROUTES.convenios.buscar);
    }
}
