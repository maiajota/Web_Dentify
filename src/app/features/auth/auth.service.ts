import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_ROUTES } from '../../core/api-routes';
import { LoginRequest } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private roteador = inject(Router);

  isAutenticado = signal(false);

  login(credenciais: LoginRequest) {
    return this.http
      .post<void>(API_ROUTES.auth.login, credenciais)
      .pipe(tap(() => this.isAutenticado.set(true)));
  }

  logout() {
    return this.http
      .post<void>(API_ROUTES.auth.logout, {})
      .pipe(
        tap(() => {
          this.isAutenticado.set(false);
          this.roteador.navigate(['/login']);
        }),
      );
  }
}
