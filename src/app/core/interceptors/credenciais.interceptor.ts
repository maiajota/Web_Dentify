import { HttpInterceptorFn } from '@angular/common/http';

export const credenciaisInterceptor: HttpInterceptorFn = (req, next) => {
    return next(req.clone({ withCredentials: true }));
};
