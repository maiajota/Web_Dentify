import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, map, switchMap } from 'rxjs';
import { LucideArrowLeft, LucideArrowRight, LucideEye, LucidePlus, LucideSearch } from '@lucide/angular';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { PacienteService } from '../paciente.service';
import { PacienteRequest, PacienteResumo } from '../paciente.model';
import { PagedResult } from '../../../core/models/paged-result.model';
import { CpfPipe } from '../cpf.pipe';
import { TelefonePipe } from '../telefone.pipe';

@Component({
    selector: 'app-lista-pacientes',
    imports: [
        ReactiveFormsModule,
        RouterLink,
        LucideArrowLeft,
        LucideArrowRight,
        LucideEye,
        LucidePlus,
        LucideSearch,
        InputText,
        Tooltip,
        CpfPipe,
        TelefonePipe,
    ],
    templateUrl: './lista-pacientes.html',
    styleUrl: './lista-pacientes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaPacientesComponent {
    private pacientesService = inject(PacienteService);
    private roteador = inject(Router);

    private filtroParams$ = new BehaviorSubject<PacienteRequest>({ pageNumber: 1, pageSize: 20 });

    totalPacientes = toSignal(
        this.pacientesService.buscar({ pageNumber: 1, pageSize: 1 }).pipe(map((r) => r.totalItems)),
        { initialValue: 0 },
    );

    pacientes = toSignal(
        this.filtroParams$.pipe(switchMap((request) => this.pacientesService.buscar(request))),
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

    verPaciente(id: number): void {
        this.roteador.navigate(['/pacientes', id]);
    }
}
