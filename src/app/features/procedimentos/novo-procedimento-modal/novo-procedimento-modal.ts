import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideX } from '@lucide/angular';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';
import { Textarea } from 'primeng/textarea';
import { ProcedimentoService } from '../procedimento.service';
import { ConvenioService } from '../../convenios/convenio.service';
import { Convenio } from '../../convenios/convenio.model';

@Component({
    selector: 'app-novo-procedimento-modal',
    imports: [
        ReactiveFormsModule,
        LucideX,
        DatePicker,
        DatePickerModule,
        Textarea,
    ],
    templateUrl: './novo-procedimento-modal.html',
    styleUrl: './novo-procedimento-modal.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovoProcedimentoModalComponent {
    private procedimentoService = inject(ProcedimentoService);
    private convenioService = inject(ConvenioService);

    readonly pacienteGuid = input.required<string>();
    readonly salvo = output<void>();
    readonly fechada = output<void>();

    salvando = signal(false);
    convenios = toSignal(this.convenioService.buscar(), { initialValue: [] as Convenio[] });

    form = new FormGroup({
        dataProcedimento: new FormControl<Date | null>(new Date(), [Validators.required]),
        descricao: new FormControl<string>('', {
            nonNullable: true,
            validators: [Validators.required],
        }),
        convenioGuid: new FormControl<string | null>(null),
    });

    fechar(): void {
        this.fechada.emit();
    }

    salvar(): void {
        if (this.form.invalid || this.salvando()) return;

        const { dataProcedimento, descricao, convenioGuid } = this.form.getRawValue();

        this.salvando.set(true);
        this.procedimentoService.adicionar({
            pacienteGuid: this.pacienteGuid(),
            dataProcedimento: dataProcedimento!,
            descricao,
            convenioGuid,
        }).subscribe({
            next: () => {
                this.salvando.set(false);
                this.salvo.emit();
                this.fechada.emit();
            },
            error: () => this.salvando.set(false),
        });
    }
}