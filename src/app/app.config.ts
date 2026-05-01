import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/styled';
import { routes } from './app.routes';
import { credenciaisInterceptor } from './core/interceptors/credenciais.interceptor';

const DentifyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50:  '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            950: '#172554',
        },
    },
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideHttpClient(withInterceptors([credenciaisInterceptor])),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: DentifyPreset, options: { darkModeSelector: false } } }),
    ],
};
