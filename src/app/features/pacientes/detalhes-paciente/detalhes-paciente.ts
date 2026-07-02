import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    LucideCalendar,
    LucideClipboardClock,
    LucideCreditCard,
    LucideMapPin,
    LucidePen,
    LucidePhone,
    LucideSettings2,
    LucideShield,
    LucideX,
} from '@lucide/angular';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PacienteService } from '../paciente.service';
import { ProcedimentoService } from '../../procedimentos/procedimento.service';
import { NovoProcedimentoModalComponent } from '../../procedimentos/novo-procedimento-modal/novo-procedimento-modal';
import { PacienteDetalhes } from '../paciente.model';
import { Procedimento } from '../../procedimentos/procedimento.model';
import { TelefonePipe } from '../telefone.pipe';
import { CpfPipe } from '../cpf.pipe';
import { TelefoneMaskDirective } from '../telefone-mask.directive';
import { ConvenioFormGroup, criarConvenioFormGroup } from '../convenios-paciente/convenios-paciente';
import { ConveniosModalComponent } from '../convenios-modal/convenios-modal';

@Component({
    selector: 'app-detalhes-paciente',
    imports: [
        DatePipe,
        ReactiveFormsModule,
        RouterLink,
        NovoProcedimentoModalComponent,
        LucideCalendar,
        LucideCreditCard,
        LucidePhone,
        LucideMapPin,
        LucideClipboardClock,
        LucidePen,
        LucideSettings2,
        LucideShield,
        LucideX,
        DatePicker,
        DatePickerModule,
        InputText,
        Tooltip,
        ToastModule,
        TelefonePipe,
        CpfPipe,
        TelefoneMaskDirective,
        ConveniosModalComponent,
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
    private roteador = inject(Router);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);

    private refresh$ = new BehaviorSubject<void>(undefined);
    private id$ = this.route.params.pipe(map((p) => p['id'] as string));

    paciente = toSignal(
        combineLatest([this.id$, this.refresh$]).pipe(
            switchMap(([id]) => this.pacientesService.buscarPorId(id))
        )
    );

    ultimosProcedimentos = toSignal(
        combineLatest([this.id$, this.refresh$]).pipe(
            switchMap(([id]) => this.procedimentosService.buscarRecentesPorPaciente(id, 3))
        ),
        { initialValue: [] as Procedimento[] }
    );

    modalAberta = signal(false);
    novoProcedimentoModalAberta = signal(false);
    salvando = signal(false);
    pacienteEmEdicao = signal<PacienteDetalhes | null>(null);

    constructor() {
        if (this.route.snapshot.queryParamMap.has('novoProcedimento')) {
            this.novoProcedimentoModalAberta.set(true);
            this.roteador.navigate([], {
                relativeTo: this.route,
                queryParams: {},
                replaceUrl: true,
            });
        }
    }

    form = this.fb.group({
        nome: ['', Validators.required],
        telefone: [''],
        dataNascimento: [null as Date | null],
        logradouro: [''],
    });

    conveniosModalAberta = signal(false);
    conveniosArray = new FormArray<ConvenioFormGroup>([]);

    onProcedimentoSalvo(): void {
        this.refresh$.next();
        this.messageService.add({
            severity: 'success',
            summary: 'Procedimento adicionado',
            detail: 'O procedimento foi registrado com sucesso.',
            life: 3000,
        });
    }

    fecharNovoProcedimentoModal(): void {
        this.novoProcedimentoModalAberta.set(false);
    }

    abrirModal(p: PacienteDetalhes): void {
        this.pacienteEmEdicao.set(p);
        this.form.patchValue({
            nome: p.nome,
            telefone: p.telefone ? new TelefonePipe().transform(p.telefone) : null,
            dataNascimento: p.dataNascimento ? new Date(p.dataNascimento) : null,
            logradouro: p.logradouro ?? null,
        });
        this.modalAberta.set(true);
    }


    fecharModal(): void {
        this.modalAberta.set(false);
        this.pacienteEmEdicao.set(null);
        this.form.reset();
    }

    abrirConveniosModal(p: PacienteDetalhes): void {
        this.conveniosArray.clear();
        for (const convenio of p.convenios) {
            this.conveniosArray.push(criarConvenioFormGroup(this.fb, convenio));
        }
        this.conveniosModalAberta.set(true);
    }

    fecharConveniosModal(): void {
        this.conveniosModalAberta.set(false);
        this.conveniosArray.clear();
    }

    onConveniosSalvos(): void {
        this.refresh$.next();
        this.messageService.add({
            severity: 'success',
            summary: 'Convênios atualizados',
            detail: 'Os convênios do paciente foram atualizados com sucesso.',
            life: 3000,
        });
    }

    salvar(): void {
        if (this.form.invalid || this.salvando()) return;

        const paciente = this.pacienteEmEdicao();
        if (!paciente) return;

        this.salvando.set(true);
        const { nome, telefone, dataNascimento, logradouro } = this.form.getRawValue();

        this.pacientesService.atualizar(paciente.guid, {
            nome: nome!,
            telefone: telefone ? telefone.replace(/\D/g, '') : null,
            dataNascimento: dataNascimento ?? null,
            logradouro: logradouro || null,
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