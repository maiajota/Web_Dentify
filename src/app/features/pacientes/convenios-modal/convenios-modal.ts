import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormArray } from '@angular/forms';
import { LucideX } from '@lucide/angular';
import { PacienteService } from '../paciente.service';
import { ConvenioFormGroup, ConveniosPacienteComponent } from '../convenios-paciente/convenios-paciente';

@Component({
    selector: 'app-convenios-modal',
    imports: [LucideX, ConveniosPacienteComponent],
    templateUrl: './convenios-modal.html',
    styleUrl: './convenios-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConveniosModalComponent {
    private pacienteService = inject(PacienteService);

    readonly pacienteGuid = input.required<string>();
    readonly linhas = input.required<FormArray<ConvenioFormGroup>>();
    readonly salvo = output<void>();
    readonly fechada = output<void>();

    salvando = signal(false);

    fechar(): void {
        this.fechada.emit();
    }

    salvar(): void {
        if (this.linhas().invalid || this.salvando()) return;

        this.salvando.set(true);
        const convenios = this.linhas().getRawValue().map((c) => ({
            convenioGuid: c.convenioGuid!,
            codigoBeneficiario: c.codigoBeneficiario!,
        }));

        this.pacienteService.atualizarConvenios(this.pacienteGuid(), convenios).subscribe({
            next: () => {
                this.salvando.set(false);
                this.salvo.emit();
                this.fechada.emit();
            },
            error: () => this.salvando.set(false),
        });
    }
}
