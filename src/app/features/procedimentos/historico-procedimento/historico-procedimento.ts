import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { LucideArrowLeft, LucideFunnel, LucidePencil, LucidePlus, LucideTrash, LucideX } from '@lucide/angular';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PacienteService } from '../../pacientes/paciente.service';
import { ProcedimentoService } from '../procedimento.service';
import { Procedimento } from '../procedimento.model';
import { ConvenioService } from '../../convenios/convenio.service';
import { Convenio } from '../../convenios/convenio.model';

@Component({
    selector: 'app-historico-procedimento',
    imports: [
        DatePipe,
        ReactiveFormsModule,
        RouterLink,
        LucideArrowLeft,
        LucideFunnel,
        LucidePencil,
        LucidePlus,
        LucideTrash,
        LucideX,
        DatePicker,
        DatePickerModule,
        MultiSelect,
        MultiSelectModule,
        InputText,
        Textarea,
        Tooltip,
        ToastModule,
    ],
    providers: [MessageService],
    templateUrl: './historico-procedimento.html',
    styleUrl: './historico-procedimento.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoricoProcedimentoComponent {
    private pacienteService = inject(PacienteService);
    private procedimentoService = inject(ProcedimentoService);
    private convenioService = inject(ConvenioService);
    private messageService = inject(MessageService);
    private route = inject(ActivatedRoute);

    private id$ = this.route.params.pipe(map((p) => +p['id']));
    private refresh$ = new BehaviorSubject<void>(undefined);
    private filtroParams$ = new BehaviorSubject<HttpParams>(new HttpParams());

    modalAberta = signal(false);
    salvando = signal(false);
    removendo = signal(false);
    procedimentoEmEdicao = signal<Procedimento | null>(null);
    procedimentoParaRemover = signal<Procedimento | null>(null);

    convenios = toSignal(this.convenioService.buscar(), { initialValue: [] as Convenio[] });

    paciente = toSignal(this.id$.pipe(switchMap((id) => this.pacienteService.buscarPorId(id))));

    procedimentos = toSignal(
        combineLatest([this.id$, this.refresh$, this.filtroParams$]).pipe(
            switchMap(([id, , params]) => this.procedimentoService.buscarPorPaciente(id, params)),
        ),
        { initialValue: [] as Procedimento[] },
    );

    filtros = new FormGroup({
        descricao: new FormControl('', { nonNullable: true }),
        convenios: new FormControl<number[]>([], { nonNullable: true }),
        periodo: new FormControl<Date[] | null>(null),
    });

    form = new FormGroup({
        dataProcedimento: new FormControl<Date | null>(new Date(), [Validators.required]),
        descricao: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        convenioId: new FormControl<number | null>(null),
    });

    filtrar(): void {
        const { descricao, convenios, periodo } = this.filtros.getRawValue();
        let params = new HttpParams();

        if (descricao) params = params.set('descricao', descricao);

        convenios.forEach((id) => (params = params.append('convenioIds', id.toString())));

        if (periodo?.[0]) params = params.set('dataInicio', periodo[0].toISOString().split('T')[0]);
        if (periodo?.[1]) params = params.set('dataFim', periodo[1].toISOString().split('T')[0]);
        this.filtroParams$.next(params);
    }

    limparFiltros(): void {
        this.filtros.reset({ descricao: '', convenios: [], periodo: null });
        this.filtroParams$.next(new HttpParams());
    }

    abrirModal(): void {
        this.procedimentoEmEdicao.set(null);
        this.form.reset({ dataProcedimento: new Date(), descricao: '', convenioId: null });
        this.modalAberta.set(true);
    }

    abrirModalEdicao(procedimento: Procedimento): void {
        this.procedimentoEmEdicao.set(procedimento);
        this.form.reset({
            dataProcedimento: new Date(`${procedimento.dataProcedimento}T00:00:00`),
            descricao: procedimento.descricao,
            convenioId: procedimento.convenioId ?? null,
        });
        this.modalAberta.set(true);
    }

    fecharModal(): void {
        this.modalAberta.set(false);
        this.procedimentoEmEdicao.set(null);
    }

    confirmarRemocao(proc: Procedimento): void {
        this.procedimentoParaRemover.set(proc);
    }

    cancelarRemocao(): void {
        this.procedimentoParaRemover.set(null);
    }

    remover(): void {
        const procedimento = this.procedimentoParaRemover();
        if (!procedimento || this.removendo()) return;

        this.removendo.set(true);
        this.procedimentoService.remover(procedimento.id).subscribe({
            next: () => {
                this.removendo.set(false);
                this.cancelarRemocao();
                this.refresh$.next();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Procedimento removido',
                    detail: 'O procedimento foi removido com sucesso.',
                    life: 3000,
                });
            },
            error: () => this.removendo.set(false),
        });
    }

    salvar(): void {
        if (this.form.invalid || this.salvando()) return;

        const emEdicao = this.procedimentoEmEdicao();
        const pacienteId = this.paciente()?.id;

        const { dataProcedimento, descricao, convenioId } = this.form.getRawValue();

        this.salvando.set(true);

        let request$;

        if (emEdicao) {
            request$ = this.procedimentoService.atualizar(emEdicao.id, {
                dataProcedimento: dataProcedimento!,
                descricao,
                convenioId,
            });
        } else {
            request$ = this.procedimentoService.adicionar({
                pacienteId: pacienteId!,
                dataProcedimento: dataProcedimento!,
                descricao,
                convenioId,
            });
        }

        if (!request$) return;

        request$.subscribe({
            next: () => {
                this.salvando.set(false);
                this.fecharModal();
                this.refresh$.next();
                this.messageService.add({
                    severity: 'success',
                    summary: emEdicao ? 'Procedimento atualizado' : 'Procedimento adicionado',
                    detail: emEdicao
                        ? 'O procedimento foi atualizado com sucesso.'
                        : 'O procedimento foi registrado com sucesso.',
                    life: 3000,
                });
            },
            error: () => this.salvando.set(false),
        });
    }
}
