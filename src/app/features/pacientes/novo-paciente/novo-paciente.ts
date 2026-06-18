import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideSave } from '@lucide/angular';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { PacienteService } from '../paciente.service';
import { PacienteCadastro } from '../paciente.model';
import { CpfMaskDirective } from '../cpf-mask.directive';
import { TelefoneMaskDirective } from '../telefone-mask.directive';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-novo-paciente',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        LucideSave,
        DatePicker,
        InputText,
        CpfMaskDirective,
        TelefoneMaskDirective,
        ToastModule,
        DatePickerModule,
    ],
    providers: [MessageService],
    templateUrl: './novo-paciente.html',
    styleUrl: './novo-paciente.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovoPacienteComponent {
    private fb = inject(FormBuilder);
    private pacientesService = inject(PacienteService);
    private roteador = inject(Router);
    private messageService = inject(MessageService);

    salvando = signal(false);
    cadastrarProcedimento = signal(false);

    form = this.fb.group({
        nome: ['', Validators.required],
        cpf: ['', Validators.required],
        telefone: [''],
        dataNascimento: [null as Date | null],
        logradouro: [''],
    });

    salvar(): void {
        if (this.form.invalid || this.salvando()) return;

        this.salvando.set(true);
        const { nome, cpf, telefone, dataNascimento, logradouro } = this.form.getRawValue();

        const novoPaciente: PacienteCadastro = {
            nome: nome!,
            cpf: cpf!.replace(/\D/g, ''),
            telefone: telefone ? telefone.replace(/\D/g, '') : null,
            dataNascimento: dataNascimento ?? null,
            logradouro: logradouro || null,
        };

        this.pacientesService.adicionar(novoPaciente).subscribe({
            next: ({ guid }) => {
                if (this.cadastrarProcedimento()) {
                    this.roteador.navigate(['/pacientes', guid], {
                        queryParams: { novoProcedimento: 'true' },
                    });
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Paciente cadastrado',
                        detail: 'O cadastro foi realizado com sucesso.',
                        life: 2000,
                    });
                    setTimeout(() => this.roteador.navigate(['/pacientes']), 2000);
                }
            },
            error: () => this.salvando.set(false),
        });
    }
}
