import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { LucidePlus, LucideTrash } from '@lucide/angular';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { ConvenioService } from '../../convenios/convenio.service';
import { Convenio } from '../../convenios/convenio.model';

export type ConvenioFormGroup = FormGroup<{
    convenioGuid: FormControl<string | null>;
    codigoBeneficiario: FormControl<string | null>;
}>;

export function criarConvenioFormGroup(
    fb: FormBuilder,
    valor?: { convenioGuid: string; codigoBeneficiario: string },
): ConvenioFormGroup {
    return fb.group({
        convenioGuid: fb.control(valor?.convenioGuid ?? null, Validators.required),
        codigoBeneficiario: fb.control(valor?.codigoBeneficiario ?? null, [
            Validators.required,
            Validators.maxLength(30),
        ]),
    });
}

@Component({
    selector: 'app-convenios-paciente',
    imports: [ReactiveFormsModule, LucidePlus, LucideTrash, InputText, Select, Tooltip],
    templateUrl: './convenios-paciente.html',
    styleUrl: './convenios-paciente.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConveniosPacienteComponent {
    private fb = inject(FormBuilder);
    private convenioService = inject(ConvenioService);

    readonly linhas = input.required<FormArray<ConvenioFormGroup>>();

    convenios = toSignal(this.convenioService.buscar(), { initialValue: [] as Convenio[] });

    adicionarLinha(): void {
        this.linhas().push(criarConvenioFormGroup(this.fb));
    }

    removerLinha(indice: number): void {
        this.linhas().removeAt(indice);
    }
}