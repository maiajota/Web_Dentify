import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LoginComponent } from './login';
import { AuthService } from '../auth.service';

const criarAuthServiceMock = () => ({
    login: vi.fn().mockReturnValue(of(null)),
});

describe('LoginComponent', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let component: LoginComponent;
    let authService: ReturnType<typeof criarAuthServiceMock>;
    let router: Router;
    let el: HTMLElement;

    beforeEach(async () => {
        authService = criarAuthServiceMock();

        await TestBed.configureTestingModule({
            imports: [LoginComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        el = fixture.nativeElement as HTMLElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('renderização inicial', () => {
        it('should render email and password inputs', () => {
            expect(el.querySelector('input[type="email"]')).toBeTruthy();
            expect(el.querySelector('input[type="password"]')).toBeTruthy();
        });

        it('should render submit button with label "Entrar"', () => {
            const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]');
            expect(btn?.textContent?.trim()).toBe('Entrar');
        });

        it('should not show any error messages on load', () => {
            expect(el.querySelector('.campo-erro')).toBeNull();
            expect(el.querySelector('.alerta-erro')).toBeNull();
        });
    });

    describe('validação', () => {
        it('should mark all fields as touched when submitting an empty form', () => {
            component.entrar();
            expect(component.emailCtrl.touched).toBe(true);
            expect(component.senhaCtrl.touched).toBe(true);
        });

        it('should not call the auth service when the form is invalid', () => {
            component.entrar();
            expect(authService.login).not.toHaveBeenCalled();
        });

        it('should show "required" error for email when touched and empty', () => {
            component.emailCtrl.markAsTouched();
            fixture.detectChanges();
            const erro = el.querySelector<HTMLElement>('#email-erro');
            expect(erro?.textContent).toContain('O e-mail é obrigatório.');
        });

        it('should show "invalid email" error when email has wrong format', () => {
            component.emailCtrl.setValue('nao-e-um-email');
            component.emailCtrl.markAsTouched();
            fixture.detectChanges();
            const erro = el.querySelector<HTMLElement>('#email-erro');
            expect(erro?.textContent).toContain('Insira um e-mail válido.');
        });

        it('should show "required" error for senha when touched and empty', () => {
            component.senhaCtrl.markAsTouched();
            fixture.detectChanges();
            const erro = el.querySelector<HTMLElement>('#senha-erro');
            expect(erro?.textContent).toContain('A senha é obrigatória.');
        });
    });

    describe('estado de carregamento', () => {
        it('should set carregando to true while the request is pending', () => {
            const pendente = new Subject<void>();
            authService.login.mockReturnValue(pendente.asObservable());

            component.form.setValue({ email: 'a@a.com', senha: '123' });
            component.entrar();

            expect(component.carregando()).toBe(true);
        });

        it('should disable the submit button while carregando is true', () => {
            component.carregando.set(true);
            fixture.detectChanges();
            const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]');
            expect(btn?.disabled).toBe(true);
        });

        it('should show "Entrando..." label while carregando is true', () => {
            component.carregando.set(true);
            fixture.detectChanges();
            const btn = el.querySelector<HTMLButtonElement>('button[type="submit"]');
            expect(btn?.textContent?.trim()).toBe('Entrando...');
        });
    });

    describe('entrar()', () => {
        beforeEach(() => {
            component.form.setValue({ email: 'dentista@clinica.com', senha: 'senha123' });
        });

        it('should call authService.login with the correct credentials', () => {
            component.entrar();
            expect(authService.login).toHaveBeenCalledWith({
                email: 'dentista@clinica.com',
                password: 'senha123',
            });
        });

        it('should navigate to "/" on successful login', () => {
            const navegar = vi.spyOn(router, 'navigate');
            authService.login.mockReturnValue(of(null));
            component.entrar();
            expect(navegar).toHaveBeenCalledWith(['/']);
        });

        it('should show error message when login fails', () => {
            authService.login.mockReturnValue(throwError(() => new Error('401')));
            component.entrar();
            fixture.detectChanges();

            expect(component.erro()).toBe('E-mail ou senha inválidos.');
            const alertaEl = el.querySelector<HTMLElement>('.alerta-erro');
            expect(alertaEl?.textContent?.trim()).toBe('E-mail ou senha inválidos.');
        });

        it('should stop loading when login fails', () => {
            authService.login.mockReturnValue(throwError(() => new Error('401')));
            component.entrar();
            expect(component.carregando()).toBe(false);
        });

        it('should clear any previous error before a new login attempt', () => {
            authService.login.mockReturnValue(throwError(() => new Error()));
            component.entrar();
            expect(component.erro()).toBeTruthy();

            authService.login.mockReturnValue(of(null));
            component.entrar();
            expect(component.erro()).toBe('');
        });
    });
});
