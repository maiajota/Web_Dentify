import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs';
import {
    LucideCalendar,
    LucideClipboardClock,
    LucideCreditCard,
    LucideMapPin,
    LucidePhone,
} from '@lucide/angular';
import { PacienteService } from '../paciente.service';
import { ProcedimentoService } from '../../procedimentos/procedimento.service';
import { Procedimento } from '../../procedimentos/procedimento.model';

@Component({
    selector: 'app-detalhes-paciente',
    imports: [
        DatePipe,
        LucideCalendar,
        LucideCreditCard,
        LucidePhone,
        LucideMapPin,
        LucideClipboardClock,
        RouterLink,
    ],
    templateUrl: './detalhes-paciente.html',
    styleUrl: './detalhes-paciente.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalhesPacienteComponent {
    private pacientesService = inject(PacienteService);
    private procedimentosService = inject(ProcedimentoService);
    private route = inject(ActivatedRoute);

    private id$ = this.route.params.pipe(map((p) => +p['id']));

    paciente = toSignal(this.id$.pipe(switchMap((id) => this.pacientesService.buscarPorId(id))));

    ultimosProcedimentos = toSignal(
        this.id$.pipe(switchMap((id) => this.procedimentosService.buscarRecentesPorPaciente(id, 3))),
        { initialValue: [] as Procedimento[] }
    );
}
