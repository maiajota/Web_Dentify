import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { CpfMaskDirective } from '../../pacientes/cpf-mask.directive';
import { CreateUsuarioRequest } from '../auth.model';

@Component({
    selector: 'app-cadastro',
    imports: [ReactiveFormsModule, RouterLink, CpfMaskDirective],
    templateUrl: './cadastro.html',
    styleUrl: './cadastro.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CadastroComponent {
    private authService = inject(AuthService);
    private roteador = inject(Router);
    private fb = inject(FormBuilder);

    form = this.fb.group({
        nome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        cpf: ['', Validators.required],
        senha: ['', [Validators.required, Validators.minLength(6)]],
        confirmarSenha: ['', Validators.required],
    });

    passo = signal<1 | 2>(1);
    carregando = signal(false);
    toast = signal<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

    get nomeCtrl() { return this.form.get('nome')!; }
    get emailCtrl() { return this.form.get('email')!; }
    get cpfCtrl() { return this.form.get('cpf')!; }
    get senhaCtrl() { return this.form.get('senha')!; }
    get confirmarSenhaCtrl() { return this.form.get('confirmarSenha')!; }

    avancar(): void {
        this.nomeCtrl.markAsTouched();
        this.emailCtrl.markAsTouched();
        this.cpfCtrl.markAsTouched();

        if (this.nomeCtrl.invalid || this.emailCtrl.invalid || this.cpfCtrl.invalid) return;

        this.passo.set(2);
    }

    cadastrar(): void {
        this.senhaCtrl.markAsTouched();
        this.confirmarSenhaCtrl.markAsTouched();

        if (this.senhaCtrl.invalid || this.confirmarSenhaCtrl.invalid) return;

        const { senha, confirmarSenha, nome, email, cpf } = this.form.getRawValue();

        if (senha !== confirmarSenha) {
            this.mostrarToast('erro', 'As senhas não coincidem.');
            return;
        }

        this.carregando.set(true);

        const request: CreateUsuarioRequest = {
            nome: nome || '',
            email: email || '',
            senha: senha || '',
            cpf: (cpf || '').replace(/\D/g, ''),
        };

        this.authService.cadastrar(request).subscribe({
            next: () => {
                this.authService.login({ email: request.email, password: request.senha }).subscribe({
                    next: () => this.roteador.navigate(['/']),
                    error: () => {
                        this.carregando.set(false);
                        this.mostrarToast('sucesso', 'Conta criada! Faça login para continuar.');
                        setTimeout(() => this.roteador.navigate(['/login']), 2500);
                    },
                });
            },
            error: () => {
                this.mostrarToast('erro', 'Erro ao criar conta. Tente novamente.');
                this.carregando.set(false);
            },
        });
    }

    private mostrarToast(tipo: 'sucesso' | 'erro', texto: string): void {
        this.toast.set({ tipo, texto });
        setTimeout(() => this.toast.set(null), 4000);
    }
}
