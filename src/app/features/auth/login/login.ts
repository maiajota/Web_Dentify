import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { LoginRequest } from '../auth.model';

@Component({
    selector: 'app-login',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    private authService = inject(AuthService);
    private roteador = inject(Router);
    private fb = inject(FormBuilder);

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        senha: ['', Validators.required],
    });

    carregando = signal(false);
    erro = signal('');

    get emailCtrl() { return this.form.get('email')!; }
    get senhaCtrl() { return this.form.get('senha')!; }

    entrar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.carregando.set(true);
        this.erro.set('');

        const { email, senha } = this.form.getRawValue();

        var loginRequest: LoginRequest = {
            email: email || '',
            password: senha || ''
        }

        this.authService.login(loginRequest).subscribe({
            next: () => this.roteador.navigate(['/']),
            error: () => {
                this.erro.set('E-mail ou senha inválidos.');
                this.carregando.set(false);
            },
        });
    }
}
