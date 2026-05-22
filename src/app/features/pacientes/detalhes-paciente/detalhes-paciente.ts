import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    LucideCalendar,
    LucideClipboardClock,
    LucideCreditCard,
    LucideMapPin,
    LucidePen,
    LucidePhone,
    LucideX,
} from '@lucide/angular';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PacienteService } from '../paciente.service';
import { ProcedimentoService } from '../../procedimentos/procedimento.service';
import { PacienteDetalhes } from '../paciente.model';
import { Procedimento } from '../../procedimentos/procedimento.model';
import { TelefonePipe } from '../telefone.pipe';
import { CpfPipe } from '../cpf.pipe';
import { TelefoneMaskDirective } from '../telefone-mask.directive';

@Component({
    selector: 'app-detalhes-paciente',
    imports: [
        DatePipe,
        ReactiveFormsModule,
        RouterLink,
        LucideCalendar,
        LucideCreditCard,
        LucidePhone,
        LucideMapPin,
        LucideClipboardClock,
        LucidePen,
        LucideX,
        DatePicker,
        DatePickerModule,
        InputText,
        Tooltip,
        ToastModule,
        TelefonePipe,
        CpfPipe,
        TelefoneMaskDirective,
    ],
    providers: [MessageService],
    templateUrl: './detalhes-paciente.html',
    styleUrl: './detalhes-paciente.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalhesPacienteComponent {
    private pacientesService = inject(PacienteService);
    private procedimentosService = inject(ProcedimentoService);
    private route = inject(ActivatedRoute);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);

    private refresh$ = new BehaviorSubject<void>(undefined);
    private id$ = this.route.params.pipe(map((p) => +p['id']));

    paciente = toSignal(
        combineLatest([this.id$, this.refresh$]).pipe(
            switchMap(([id]) => this.pacientesService.buscarPorId(id))
        )
    );

    ultimosProcedimentos = toSignal(
        this.id$.pipe(switchMap((id) => this.procedimentosService.buscarRecentesPorPaciente(id, 3))),
        { initialValue: [] as Procedimento[] }
    );

    modalAberta = signal(false);
    salvando = signal(false);
    pacienteEmEdicao = signal<PacienteDetalhes | null>(null);

    form = this.fb.group({
        nome: ['', Validators.required],
        telefone: ['', Validators.required],
        dataNascimento: [null as Date | null, Validators.required],
        logradouro: ['', Validators.required],
    });

    abrirModal(p: PacienteDetalhes): void {
        this.pacienteEmEdicao.set(p);
        this.form.patchValue({
            nome: p.nome,
            telefone: new TelefonePipe().transform(p.telefone),
            dataNascimento: new Date(p.dataNascimento),
            logradouro: p.logradouro,
        });
        this.modalAberta.set(true);
    }

    fecharModal(): void {
        this.modalAberta.set(false);
        this.pacienteEmEdicao.set(null);
        this.form.reset();
    }

    salvar(): void {
        if (this.form.invalid || this.salvando()) return;

        const paciente = this.pacienteEmEdicao();
        if (!paciente) return;

        this.salvando.set(true);
        const { nome, telefone, dataNascimento, logradouro } = this.form.getRawValue();

        this.pacientesService.atualizar(paciente.id, {
            nome: nome!,
            telefone: telefone!.replace(/\D/g, ''),
            dataNascimento: dataNascimento!,
            logradouro: logradouro!,
        }).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Paciente atualizado',
                    detail: 'Os dados foram atualizados com sucesso.',
                    life: 3000,
                });
                this.salvando.set(false);
                this.fecharModal();
                this.refresh$.next();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao atualizar',
                    detail: 'Não foi possível atualizar os dados do paciente.',
                    life: 4000,
                });
                this.salvando.set(false);
            },
        });
    }
}