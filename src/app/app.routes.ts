import { Routes } from '@angular/router';
import { LayoutPrincipalComponent } from './layout/layout-principal/layout-principal';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/login/login').then((m) => m.LoginComponent),
    },
    {
        path: '',
        component: LayoutPrincipalComponent,
        children: [
            {
                path: '',
                redirectTo: 'pacientes',
                pathMatch: 'full',
            },
            {
                path: 'pacientes',
                loadComponent: () =>
                    import('./features/pacientes/lista-pacientes/lista-pacientes').then(
                        (m) => m.ListaPacientesComponent,
                    ),
            },
        ],
    },
];
