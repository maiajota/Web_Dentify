import { Directive } from '@angular/core';

@Directive({
    selector: '[appTelefoneMask]',
    host: {
        '(input)': 'onInput($event)',
    },
})
export class TelefoneMaskDirective {
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const digits = input.value.replace(/\D/g, '').slice(0, 11);
        input.value = this.format(digits);
    }

    private format(digits: string): string {
        if (digits.length === 0) return '';
        if (digits.length <= 2) return `(${digits}`;
        if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
}
