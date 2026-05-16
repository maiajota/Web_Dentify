import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { LucideArrowLeft, LucideFunnel, LucidePlus, LucideTrash, LucideX } from '@lucide/angular';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PacienteService } from '../../pacientes/paciente.service';
import { ProcedimentoService } from '../procedimento.service';
import { Procedimento, ProcedimentoCadastro } from '../procedimento.model';
import { ConvenioService } from '../../convenios/convenio.service';
import { Convenio } from '../../convenios/convenio.model';

@Component({
    selector: 'app-historico-procedimento',
    imports: [DatePipe, ReactiveFormsModule, RouterLink, LucideArrowLeft, LucideFunnel, LucidePlus, LucideTrash, LucideX, DatePicker, DatePickerModule, MultiSelect, MultiSelectModule, InputText, Textarea, Tooltip, ToastModule],
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

    convenios = toSignal(this.convenioService.buscar(), { initialValue: [] as Convenio[] });

    paciente = toSignal(this.id$.pipe(switchMap((id) => this.pacienteService.buscarPorId(id))));

    procedimentos = toSignal(
        combineLatest([this.id$, this.refresh$, this.filtroParams$]).pipe(
            switchMap(([id, , params]) => this.procedimentoService.buscarPorPaciente(id, params))
        ),
        { initialValue: [] as Procedimento[] }
    );

    filtros = new FormGroup({
        descricao: new FormControl('', { nonNullable: true }),
        convenios: new FormControl<number[]>([], { nonNullable: true }),
        periodo: new FormControl<Date[] | null>(null),
    });

    form = new FormGroup({
        dataProcedimento: new FormControl<Date | null>(new Date(), [Validators.required]),
        descricao: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
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
        this.form.reset({ dataProcedimento: new Date(), descricao: '', convenioId: null });
        this.modalAberta.set(true);
    }

    fecharModal(): void {
        this.modalAberta.set(false);
    }

    salvar(): void {
        if (this.form.invalid || this.salvando()) return;

        const pacienteId = this.paciente()?.id;
        if (!pacienteId) return;

        const { dataProcedimento, descricao, convenioId } = this.form.getRawValue();

        const payload: ProcedimentoCadastro = {
            dataProcedimento: dataProcedimento!,
            descricao,
            convenioId: convenioId,
            pacienteId,
        };

        this.salvando.set(true);
        this.procedimentoService.adicionar(payload).subscribe({
            next: () => {
                this.salvando.set(false);
                this.fecharModal();
                this.refresh$.next();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Procedimento adicionado',
                    detail: 'O procedimento foi registrado com sucesso.',
                    life: 3000,
                });
            },
            error: () => this.salvando.set(false),
        });
    }
}
