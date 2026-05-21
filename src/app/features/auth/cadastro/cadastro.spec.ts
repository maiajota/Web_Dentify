import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CadastroComponent } from './cadastro';
import { AuthService } from '../auth.service';

const criarAuthServiceMock = () => ({
    cadastrar: vi.fn().mockReturnValue(of(null)),
    login: vi.fn().mockReturnValue(of(null)),
});

describe('CadastroComponent', () => {
    let fixture: ComponentFixture<CadastroComponent>;
    let component: CadastroComponent;
    let authService: ReturnType<typeof criarAuthServiceMock>;
    let router: Router;
    let el: HTMLElement;

    beforeEach(async () => {
        authService = criarAuthServiceMock();

        await TestBed.configureTestingModule({
            imports: [CadastroComponent],
            providers: [
                provideRouter([]),
                { provide: AuthService, useValue: authService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CadastroComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        el = fixture.nativeElement as HTMLElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('passo 1 - dados pessoais', () => {
        describe('renderização inicial', () => {
            it('should render nome, cpf and email inputs', () => {
                expect(el.querySelector('input#nome')).toBeTruthy();
                expect(el.querySelector('input#cpf')).toBeTruthy();
                expect(el.querySelector('input#email')).toBeTruthy();
            });

            it('should render "Avançar" button', () => {
                const btn = el.querySelector<HTMLButtonElement>('button');
                expect(btn?.textContent?.trim()).toBe('Avançar');
            });

            it('should not show senha inputs on passo 1', () => {
                expect(el.querySelector('input#senha')).toBeNull();
                expect(el.querySelector('input#confirmar-senha')).toBeNull();
            });

            it('should not show any error messages on load', () => {
                expect(el.querySelector('.campo-erro')).toBeNull();
            });
        });

        describe('validação', () => {
            it('should mark all step 1 fields as touched when advancing with empty form', () => {
                component.avancar();
                expect(component.nomeCtrl.touched).toBe(true);
                expect(component.emailCtrl.touched).toBe(true);
                expect(component.cpfCtrl.touched).toBe(true);
            });

            it('should not advance to passo 2 when fields are invalid', () => {
                component.avancar();
                expect(component.passo()).toBe(1);
            });

            it('should show required error for nome', () => {
                component.nomeCtrl.markAsTouched();
                fixture.detectChanges();
                expect(el.querySelector('#nome-erro')?.textContent).toContain('O nome é obrigatório.');
            });

            it('should show required error for cpf', () => {
                component.cpfCtrl.markAsTouched();
                fixture.detectChanges();
                expect(el.querySelector('#cpf-erro')?.textContent).toContain('O CPF é obrigatório.');
            });

            it('should show required error for email', () => {
                component.emailCtrl.markAsTouched();
                fixture.detectChanges();
                expect(el.querySelector('#email-erro')?.textContent).toContain('O e-mail é obrigatório.');
            });

            it('should show invalid email error when email format is wrong', () => {
                component.emailCtrl.setValue('email-invalido');
                component.emailCtrl.markAsTouched();
                fixture.detectChanges();
                expect(el.querySelector('#email-erro')?.textContent).toContain('Insira um e-mail válido.');
            });
        });

        describe('avancar()', () => {
            it('should advance to passo 2 when all step 1 fields are valid', () => {
                component.form.patchValue({ nome: 'João Silva', email: 'joao@email.com', cpf: '123.456.789-00' });
                component.avancar();
                expect(component.passo()).toBe(2);
            });
        });
    });

    describe('passo 2 - senha', () => {
        beforeEach(() => {
            component.form.patchValue({ nome: 'João Silva', email: 'joao@email.com', cpf: '123.456.789-00' });
            component.avancar();
            fixture.detectChanges();
        });

        describe('renderização', () => {
            it('should render senha and confirmarSenha inputs', () => {
                expect(el.querySelector('input#senha')).toBeTruthy();
                expect(el.querySelector('input#confirmar-senha')).toBeTruthy();
            });

            it('should render "Cadastrar" button', () => {
                const btn = el.querySelector<HTMLButtonElement>('button');
                expect(btn?.textContent?.trim()).toBe('Cadastrar');
            });

            it('should not show step 1 inputs on passo 2', () => {
                expect(el.querySelector('input#nome')).toBeNull();
                expect(el.querySelector('input#cpf')).toBeNull();
                expect(el.querySelector('input#email')).toBeNull();
            });
        });

        describe('validação', () => {
            it('should mark senha and confirmarSenha as touched when submitting empty', () => {
                component.cadastrar();
                expect(component.senhaCtrl.touched).toBe(true);
                expect(component.confirmarSenhaCtrl.touched).toBe(true);
            });

            it('should not call service when fields are invalid', () => {
                component.cadastrar();
                expect(authService.cadastrar).not.toHaveBeenCalled();
            });

            it('should show required error for senha', () => {
                component.senhaCtrl.markAsTouched();
                fixture.detectChanges();
                expect(el.querySelector('#senha-erro')?.textContent).toContain('A senha é obrigatória.');
            });

            it('should show minlength error for senha with less than 6 characters', () => {
                component.senhaCtrl.setValue('123');
                component.senhaCtrl.markAsTouched();
                fixture.detectChanges();
                expect(el.querySelector('#senha-erro')?.textContent).toContain('A senha deve ter no mínimo 6 caracteres.');
            });

            it('should show required error for confirmarSenha', () => {
                component.confirmarSenhaCtrl.markAsTouched();
                fixture.detectChanges();
                expect(el.querySelector('#confirmar-senha-erro')?.textContent).toContain('A confirmação de senha é obrigatória.');
            });

            it('should show error toast when passwords do not match', () => {
                component.form.patchValue({ senha: 'senha123', confirmarSenha: 'outra456' });
                component.cadastrar();
                expect(component.toast()).toEqual({ tipo: 'erro', texto: 'As senhas não coincidem.' });
            });

            it('should not call service when passwords do not match', () => {
                component.form.patchValue({ senha: 'senha123', confirmarSenha: 'outra456' });
                component.cadastrar();
                expect(authService.cadastrar).not.toHaveBeenCalled();
            });
        });

        describe('estado de carregamento', () => {
            it('should set carregando to true while request is pending', () => {
                const pendente = new Subject<void>();
                authService.cadastrar.mockReturnValue(pendente.asObservable());
                component.form.patchValue({ senha: 'senha123', confirmarSenha: 'senha123' });
                component.cadastrar();
                expect(component.carregando()).toBe(true);
            });

            it('should disable the button while carregando is true', () => {
                component.carregando.set(true);
                fixture.detectChanges();
                const btn = el.querySelector<HTMLButtonElement>('button');
                expect(btn?.disabled).toBe(true);
            });

            it('should show "Cadastrando..." while carregando is true', () => {
                component.carregando.set(true);
                fixture.detectChanges();
                const btn = el.querySelector<HTMLButtonElement>('button');
                expect(btn?.textContent?.trim()).toBe('Cadastrando...');
            });
        });

        describe('cadastrar()', () => {
            beforeEach(() => {
                component.form.patchValue({ senha: 'senha123', confirmarSenha: 'senha123' });
            });

            it('should call cadastrar with CPF stripped of formatting', () => {
                component.cadastrar();
                expect(authService.cadastrar).toHaveBeenCalledWith({
                    nome: 'João Silva',
                    email: 'joao@email.com',
                    cpf: '12345678900',
                    senha: 'senha123',
                });
            });

            it('should call login with email and senha after successful registration', () => {
                component.cadastrar();
                expect(authService.login).toHaveBeenCalledWith({
                    email: 'joao@email.com',
                    password: 'senha123',
                });
            });

            it('should navigate to "/" after successful login', () => {
                const navegar = vi.spyOn(router, 'navigate');
                component.cadastrar();
                expect(navegar).toHaveBeenCalledWith(['/']);
            });

            it('should show success toast when auto-login fails after registration', () => {
                authService.login.mockReturnValue(throwError(() => new Error()));
                component.cadastrar();
                expect(component.toast()).toEqual({ tipo: 'sucesso', texto: 'Conta criada! Faça login para continuar.' });
            });

            it('should show error toast when cadastrar fails', () => {
                authService.cadastrar.mockReturnValue(throwError(() => new Error()));
                component.cadastrar();
                expect(component.toast()).toEqual({ tipo: 'erro', texto: 'Erro ao criar conta. Tente novamente.' });
            });

            it('should stop loading when cadastrar fails', () => {
                authService.cadastrar.mockReturnValue(throwError(() => new Error()));
                component.cadastrar();
                expect(component.carregando()).toBe(false);
            });
        });
    });
});