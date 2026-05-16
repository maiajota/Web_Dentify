import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideEye, LucidePlus, LucideSearch } from '@lucide/angular';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { PacienteService } from '../paciente.service';

@Component({
    selector: 'app-lista-pacientes',
    imports: [FormsModule, RouterLink, LucidePlus, LucideEye, LucideSearch, InputText, Tooltip],
    templateUrl: './lista-pacientes.html',
    styleUrl: './lista-pacientes.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaPacientesComponent {
    private pacientesService = inject(PacienteService);
    private roteador = inject(Router);

    termoBusca = signal('');
    pacientes = toSignal(this.pacientesService.buscar(), { initialValue: [] });

    pacientesFiltrados = computed(() => {
        const termo = this.termoBusca().toLowerCase().trim();
        if (!termo) return this.pacientes();

        return this.pacientes().filter(
            (p) => p.nome.toLowerCase().includes(termo) || p.cpf.includes(termo),
        );
    });

    verPaciente(id: number): void {
        this.roteador.navigate(['/pacientes', id]);
    }
}
