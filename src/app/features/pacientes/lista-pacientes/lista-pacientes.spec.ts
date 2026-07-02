import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { ListaPacientesComponent } from './lista-pacientes';
import { PacienteService } from '../paciente.service';
import { PacienteRequest, PacienteResumo } from '../paciente.model';
import { PagedResult } from '../../../core/models/paged-result.model';

const PACIENTES_MOCK: PacienteResumo[] = [
    { guid: 'guid-1', nome: 'João Victor', cpf: '12345678900', telefone: '11911111111', quantidadeProcedimentos: 2 },
    { guid: 'guid-2', nome: 'Maria Laura', cpf: '98765432100', telefone: '11922222222', quantidadeProcedimentos: 4 },
    { guid: 'guid-3', nome: 'Diana Maia', cpf: '11122233344', telefone: '11933333333', quantidadeProcedimentos: 0 },
];

function pagedResult(overrides?: Partial<PagedResult<PacienteResumo>>): PagedResult<PacienteResumo> {
    return { data: PACIENTES_MOCK, pageNumber: 1, pageSize: 20, totalItems: 3, totalPages: 1, ...overrides };
}

function contarLinhas(el: HTMLElement): NodeListOf<HTMLElement> {
    return el.querySelectorAll<HTMLElement>('tbody tr.tabela-linha');
}

async function criarFixture(result = pagedResult()) {
    const pacientesService = { buscar: vi.fn().mockReturnValue(of(result)) };

    await TestBed.configureTestingModule({
        imports: [ListaPacientesComponent],
        providers: [
            provideRouter([]),
            { provide: PacienteService, useValue: pacientesService },
            MessageService,
        ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ListaPacientesComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    return { fixture, component, router, el, pacientesService };
}

// ─── cenário padrão (3 pacientes, 1 página) ──────────────────────────────────

describe('ListaPacientesComponent', () => {
    let fixture: ComponentFixture<ListaPacientesComponent>;
    let component: ListaPacientesComponent;
    let pacientesService: { buscar: ReturnType<typeof vi.fn> };
    let router: Router;
    let el: HTMLElement;

    beforeEach(async () => {
        ({ fixture, component, router, el, pacientesService } = await criarFixture());
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });

    describe('renderização', () => {
        it('deve exibir uma linha por paciente', () => {
            expect(contarLinhas(el).length).toBe(3);
        });

        it('deve exibir o total de pacientes no subtítulo', () => {
            const subtitulo = el.querySelector<HTMLElement>('.cabecalho-subtitulo');
            expect(subtitulo?.textContent).toContain('3 pacientes cadastrados');
        });

        it('deve exibir o nome do paciente na linha', () => {
            expect(contarLinhas(el)[0].textContent).toContain('João Victor');
        });

        it('deve exibir a quantidade de procedimentos em um badge', () => {
            const badge = contarLinhas(el)[0].querySelector<HTMLElement>('.badge-procedimentos');
            expect(badge?.textContent?.trim()).toBe('2');
        });

        it('não deve exibir a nav de paginação quando há apenas uma página', () => {
            expect(el.querySelector('.paginacao')).toBeNull();
        });
    });

    describe('buscar()', () => {
        it('deve chamar o serviço com o termo preenchido', () => {
            component.filtros.patchValue({ termo: 'João' });
            component.buscar();
            const req = pacientesService.buscar.mock.calls.at(-1)?.[0] as PacienteRequest;
            expect(req.termo).toBe('João');
        });

        it('deve enviar termo undefined quando o campo está vazio', () => {
            component.filtros.patchValue({ termo: '' });
            component.buscar();
            const req = pacientesService.buscar.mock.calls.at(-1)?.[0] as PacienteRequest;
            expect(req.termo).toBeUndefined();
        });

        it('deve resetar para a primeira página ao buscar', () => {
            component.filtros.patchValue({ termo: 'João' });
            component.buscar();
            const req = pacientesService.buscar.mock.calls.at(-1)?.[0] as PacienteRequest;
            expect(req.pageNumber).toBe(1);
        });
    });

    describe('navegação', () => {
        it('deve navegar para a rota de detalhe ao chamar verPaciente()', () => {
            const navegar = vi.spyOn(router, 'navigate');
            component.verPaciente('guid-2');
            expect(navegar).toHaveBeenCalledWith(['/pacientes', 'guid-2']);
        });

        it('deve navegar ao clicar no botão "Ver detalhes"', () => {
            const navegar = vi.spyOn(router, 'navigate');
            el.querySelector<HTMLButtonElement>('.botao-acao')?.click();
            expect(navegar).toHaveBeenCalledWith(['/pacientes', 'guid-1']);
        });
    });
});

// ─── cenário sem pacientes ────────────────────────────────────────────────────

describe('ListaPacientesComponent sem pacientes', () => {
    let el: HTMLElement;

    beforeEach(async () => {
        ({ el } = await criarFixture(pagedResult({ data: [], totalItems: 0 })));
    });

    it('deve exibir o estado vazio', () => {
        const vazia = el.querySelector<HTMLElement>('.tabela-vazia');
        expect(vazia).not.toBeNull();
        expect(vazia?.textContent).toContain('Nenhum paciente encontrado.');
    });
});

// ─── cenário com múltiplas páginas (página 1 de 3) ───────────────────────────

describe('ListaPacientesComponent com múltiplas páginas', () => {
    let component: ListaPacientesComponent;
    let pacientesService: { buscar: ReturnType<typeof vi.fn> };
    let el: HTMLElement;

    beforeEach(async () => {
        ({ component, el, pacientesService } = await criarFixture(
            pagedResult({ pageNumber: 1, totalPages: 3, totalItems: 60 }),
        ));
    });

    it('deve exibir a nav de paginação', () => {
        expect(el.querySelector('.paginacao')).not.toBeNull();
    });

    it('deve exibir a página atual e o total de páginas', () => {
        const info = el.querySelector<HTMLElement>('.paginacao-info');
        expect(info?.textContent?.trim()).toBe('1 de 3');
    });

    it('botão anterior deve estar disabled na primeira página', () => {
        const botao = el.querySelector<HTMLButtonElement>('[aria-label="Página anterior"]');
        expect(botao?.disabled).toBe(true);
    });

    it('botão próximo deve estar enabled na primeira página', () => {
        const botao = el.querySelector<HTMLButtonElement>('[aria-label="Próxima página"]');
        expect(botao?.disabled).toBe(false);
    });

    it('proximaPagina deve chamar o service com pageNumber incrementado', () => {
        component.proximaPagina();
        const req = pacientesService.buscar.mock.calls.at(-1)?.[0] as PacienteRequest;
        expect(req.pageNumber).toBe(2);
    });

    it('paginaAnterior não deve chamar o service quando já está na primeira página', () => {
        const chamadasAntes = pacientesService.buscar.mock.calls.length;
        component.paginaAnterior();
        expect(pacientesService.buscar.mock.calls.length).toBe(chamadasAntes);
    });

    it('paginaAnterior deve chamar o service com pageNumber decrementado', () => {
        component.proximaPagina();
        component.paginaAnterior();
        const req = pacientesService.buscar.mock.calls.at(-1)?.[0] as PacienteRequest;
        expect(req.pageNumber).toBe(1);
    });
});

// ─── cenário na última página ─────────────────────────────────────────────────

describe('ListaPacientesComponent na última página', () => {
    let el: HTMLElement;

    beforeEach(async () => {
        ({ el } = await criarFixture(pagedResult({ pageNumber: 3, totalPages: 3, totalItems: 60 })));
    });

    it('botão próximo deve estar disabled', () => {
        const botao = el.querySelector<HTMLButtonElement>('[aria-label="Próxima página"]');
        expect(botao?.disabled).toBe(true);
    });

    it('botão anterior deve estar enabled', () => {
        const botao = el.querySelector<HTMLButtonElement>('[aria-label="Página anterior"]');
        expect(botao?.disabled).toBe(false);
    });
});