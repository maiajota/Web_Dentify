import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, map, switchMap } from 'rxjs';
import { LucideArrowLeft, LucideArrowRight, LucideClipboardPen, LucideEye, LucidePlus, LucideSearch } from '@lucide/angular';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PacienteService } from '../paciente.service';
import { PacienteRequest, PacienteResumo } from '../paciente.model';
import { PagedResult } from '../../../core/models/paged-result.model';
import { CpfPipe } from '../cpf.pipe';
import { TelefonePipe } from '../telefone.pipe';
import { NovoProcedimentoModalComponent } from '../../procedimentos/novo-procedimento-modal/novo-procedimento-modal';

@Component({
    selector: 'app-lista-pacientes',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        LucideArrowLeft,
        LucideArrowRight,
        LucideClipboardPen,
        LucideEye,
        LucidePlus,
        LucideSearch,
        InputText,
        Tooltip,
        ToastModule,
        CpfPipe,
        TelefonePipe,
        NovoProcedimentoModalComponent,
    ],
    providers: [MessageService],
    templateUrl: './lista-pacientes.html',
    styleUrl: './lista-pacientes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaPacientesComponent {
    private pacientesService = inject(PacienteService);
    private messageService = inject(MessageService);
    private roteador = inject(Router);

    private filtroParams$ = new BehaviorSubject<PacienteRequest>({ pageNumber: 1, pageSize: 20 });
    private refresh$ = new BehaviorSubject<void>(undefined);

    pacienteSelecionadoGuid = signal<string | null>(null);

    totalPacientes = toSignal(
        this.pacientesService.buscar({ pageNumber: 1, pageSize: 1 }).pipe(map((r) => r.totalItems)),
        { initialValue: 0 },
    );

    pacientes = toSignal(
        combineLatest([this.filtroParams$, this.refresh$]).pipe(
            switchMap(([request]) => this.pacientesService.buscar(request)),
        ),
        {
            initialValue: {
                data: [],
                pageNumber: 1,
                pageSize: 20,
                totalItems: 0,
                totalPages: 0,
            } as PagedResult<PacienteResumo>,
        },
    );

    filtros = new FormGroup({
        termo: new FormControl('', { nonNullable: true }),
    });

    buscar(): void {
        const { termo } = this.filtros.getRawValue();
        this.filtroParams$.next({
            pageNumber: 1,
            pageSize: 20,
            termo: termo || undefined,
        });
    }

    paginaAnterior(): void {
        const atual = this.filtroParams$.getValue();
        if (atual.pageNumber <= 1) return;
        this.filtroParams$.next({ ...atual, pageNumber: atual.pageNumber - 1 });
    }

    proximaPagina(): void {
        const atual = this.filtroParams$.getValue();
        if (atual.pageNumber >= this.pacientes().totalPages) return;
        this.filtroParams$.next({ ...atual, pageNumber: atual.pageNumber + 1 });
    }

    verPaciente(guid: string): void {
        this.roteador.navigate(['/pacientes', guid]);
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
}
