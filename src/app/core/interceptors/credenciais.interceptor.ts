import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const credenciaisInterceptor: HttpInterceptorFn = (req, next) => {
    const roteador = inject(Router);

    return next(req.clone({ withCredentials: true })).pipe(
        catchError((erro: HttpErrorResponse) => {
            if (erro.status === 401) {
                void roteador.navigate(['/login']);
            }
            return throwError(() => erro);
        }),
    );
};
