import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NovoProcedimentoModalComponent } from '../novo-procedimento-modal/novo-procedimento-modal';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { LucideArrowLeft, LucideArrowRight, LucideFunnel, LucidePencil, LucidePlus, LucideTrash, LucideX } from '@lucide/angular';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PacienteService } from '../../pacientes/paciente.service';
import { ProcedimentoService } from '../procedimento.service';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Procedimento, ProcedimentoRequest } from '../procedimento.model';
import { ConvenioService } from '../../convenios/convenio.service';
import { Convenio } from '../../convenios/convenio.model';

@Component({
    selector: 'app-historico-procedimento',
    imports: [
        DatePipe,
        ReactiveFormsModule,
        RouterLink,
        LucideArrowLeft,
        LucideArrowRight,
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
        NovoProcedimentoModalComponent,
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

    private id$ = this.route.params.pipe(map((p) => p['id'] as string));
    private refresh$ = new BehaviorSubject<void>(undefined);
    private filtroParams$ = new BehaviorSubject<ProcedimentoRequest>({ pageNumber: 1, pageSize: 20 });

    novoModalAberto = signal(false);
    modalAberta = signal(false);
    salvando = signal(false);
    removendo = signal(false);
    procedimentoEmEdicao = signal<Procedimento | null>(null);
    procedimentoParaRemover = signal<Procedimento | null>(null);

    convenios = toSignal(this.convenioService.buscar(), { initialValue: [] as Convenio[] });

    paciente = toSignal(this.id$.pipe(switchMap((id) => this.pacienteService.buscarPorId(id))));

    procedimentos = toSignal(
        combineLatest([this.id$, this.refresh$, this.filtroParams$]).pipe(
            switchMap(([id, ,request]) => this.procedimentoService.buscarPorPaciente(id, request)),
        ),
        { initialValue: { data: [], pageNumber: 1, pageSize: 20, totalItems: 0, totalPages: 0 } as PagedResult<Procedimento> },
    );

    filtros = new FormGroup({
        descricao: new FormControl('', { nonNullable: true }),
        convenioGuids: new FormControl<string[]>([], { nonNullable: true }),
        periodo: new FormControl<Date[] | null>(null),
    });

    form = new FormGroup({
        dataProcedimento: new FormControl<Date | null>(new Date(), [Validators.required]),
        descricao: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        convenioGuid: new FormControl<string | null>(null),
    });

    filtrar(): void {
        const { descricao, convenioGuids, periodo } = this.filtros.getRawValue();
        this.filtroParams$.next({
            pageNumber: 1,
            pageSize: 20,
            descricao: descricao || undefined,
            convenioGuids,
            dataInicio: periodo?.[0]?.toISOString().split('T')[0],
            dataFim: periodo?.[1]?.toISOString().split('T')[0],
        });
    }

    paginaAnterior(): void {
        const atual = this.filtroParams$.getValue();
        if (atual.pageNumber <= 1) return;

        this.filtroParams$.next({ ...atual, pageNumber: atual.pageNumber - 1 });
    }

    proximaPagina(): void {
        const atual = this.filtroParams$.getValue();
        if (atual.pageNumber >= this.procedimentos().totalPages) return;

        this.filtroParams$.next({ ...atual, pageNumber: atual.pageNumber + 1 });
    }

    limparFiltros(): void {
        this.filtros.reset({ descricao: '', convenioGuids: [], periodo: null });
        this.filtroParams$.next({ pageNumber: 1, pageSize: 20 });
    }

    onNovoProcedimentoSalvo(): void {
        this.refresh$.next();
        this.messageService.add({
            severity: 'success',
            summary: 'Procedimento adicionado',
            detail: 'O procedimento foi registrado com sucesso.',
            life: 3000,
        });
    }

    abrirModalEdicao(procedimento: Procedimento): void {
        this.procedimentoEmEdicao.set(procedimento);
        this.form.reset({
            dataProcedimento: new Date(`${procedimento.dataProcedimento}T00:00:00`),
            descricao: procedimento.descricao,
            convenioGuid: procedimento.convenioGuid ?? null,
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
        this.procedimentoService.remover(procedimento.guid).subscribe({
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
        const pacienteGuid = this.paciente()?.guid;

        const { dataProcedimento, descricao, convenioGuid } = this.form.getRawValue();

        this.salvando.set(true);

        let request$;

        if (emEdicao) {
            request$ = this.procedimentoService.atualizar(emEdicao.guid, {
                dataProcedimento: dataProcedimento!,
                descricao,
                convenioGuid,
            });
        } else {
            request$ = this.procedimentoService.adicionar({
                pacienteGuid: pacienteGuid!,
                dataProcedimento: dataProcedimento!,
                descricao,
                convenioGuid,
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
