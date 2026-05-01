import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ListaPacientesComponent } from './lista-pacientes';
import { PacienteService } from '../paciente.service';
import { Paciente } from '../paciente.model';

const PACIENTES_MOCK: Paciente[] = [
    {
        id: 1,
        nome: 'João Victor',
        cpf: '123.456.789-00',
        telefone: '(11) 91111-1111',
        DataNascimento: new Date('1990-01-15'),
        logradouro: 'Rua A, 100',
        usuarioId: 1,
    },
    {
        id: 2,
        nome: 'Maria Laura',
        cpf: '987.654.321-00',
        telefone: '(11) 92222-2222',
        DataNascimento: new Date('1985-06-20'),
        logradouro: 'Rua B, 200',
        usuarioId: 1,
    },
    {
        id: 3,
        nome: 'Diana Maia',
        cpf: '111.222.333-44',
        telefone: '(11) 93333-3333',
        DataNascimento: new Date('1978-12-01'),
        logradouro: 'Rua C, 300',
        usuarioId: 1,
    },
];

function contarLinhas(el: HTMLElement): NodeListOf<HTMLElement> {
    return el.querySelectorAll<HTMLElement>('tbody tr.tabela-linha');
}

describe('ListaPacientesComponent', () => {
    let fixture: ComponentFixture<ListaPacientesComponent>;
    let component: ListaPacientesComponent;
    let pacientesService: { buscar: ReturnType<typeof vi.fn> };
    let router: Router;
    let el: HTMLElement;

    beforeEach(async () => {
        pacientesService = {
            buscar: vi.fn().mockReturnValue(of(PACIENTES_MOCK)),
        };

        await TestBed.configureTestingModule({
            imports: [ListaPacientesComponent],
            providers: [
                provideRouter([]),
                { provide: PacienteService, useValue: pacientesService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ListaPacientesComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        await fixture.whenStable();
        fixture.detectChanges();
        el = el as HTMLElement;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('renderização', () => {
        it('should display one row per patient', () => {
            expect(contarLinhas(el).length).toBe(3);
        });

        it('should show correct patient count in the subtitle', () => {
            const subtitulo = el.querySelector<HTMLElement>('.cabecalho-subtitulo');
            expect(subtitulo?.textContent).toContain('3 pacientes cadastrados');
        });

        it('should display patient name and CPF in the row', () => {
            const primeiraLinha = contarLinhas(el)[0];
            expect(primeiraLinha.textContent).toContain('João Victor');
            expect(primeiraLinha.textContent).toContain('123.456.789-00');
        });
    });

    describe('filtro', () => {
        it('should show all patients when the search term is empty', () => {
            component.termoBusca.set('');
            fixture.detectChanges();
            expect(contarLinhas(el).length).toBe(3);
        });

        it('should filter by name (case insensitive)', () => {
            component.termoBusca.set('joão');
            fixture.detectChanges();
            const linhas = contarLinhas(el);
            expect(linhas.length).toBe(1);
            expect(linhas[0].textContent).toContain('João Victor');
        });

        it('should filter by CPF', () => {
            component.termoBusca.set('987.654');
            fixture.detectChanges();
            const linhas = contarLinhas(el);
            expect(linhas.length).toBe(1);
            expect(linhas[0].textContent).toContain('Maria Laura');
        });

        it('should show empty state when no patient matches', () => {
            component.termoBusca.set('zzz-nao-existe');
            fixture.detectChanges();
            expect(contarLinhas(el).length).toBe(0);
            const vazia = el.querySelector<HTMLElement>('.tabela-vazia');
            expect(vazia?.textContent).toContain('Nenhum paciente encontrado.');
        });

        it('should restore full list when search term is cleared', () => {
            component.termoBusca.set('joão');
            fixture.detectChanges();
            component.termoBusca.set('');
            fixture.detectChanges();
            expect(contarLinhas(el).length).toBe(3);
        });

        it('should ignore leading/trailing whitespace in the search term', () => {
            component.termoBusca.set('  maria  ');
            fixture.detectChanges();
            expect(contarLinhas(el).length).toBe(1);
        });
    });

    describe('navegação', () => {
        it('should navigate to the patient detail route when verPaciente() is called', () => {
            const navegar = vi.spyOn(router, 'navigate');
            component.verPaciente(2);
            expect(navegar).toHaveBeenCalledWith(['/pacientes', 2]);
        });

        it('should navigate when a table row is clicked', () => {
            const navegar = vi.spyOn(router, 'navigate');
            const primeiraLinha = contarLinhas(el)[0];
            primeiraLinha.click();
            expect(navegar).toHaveBeenCalledWith(['/pacientes', 1]);
        });

        it('should navigate when the "Ver detalhes" button is clicked', () => {
            const navegar = vi.spyOn(router, 'navigate');
            // O botão de detalhes é o primeiro botão de ação da linha
            const botaoDetalhes = el.querySelector<HTMLButtonElement>('.botao-acao');
            botaoDetalhes?.click();
            expect(navegar).toHaveBeenCalledWith(['/pacientes', 1]);
        });
    });
});

describe('ListaPacientesComponent sem pacientes', () => {
    let fixture: ComponentFixture<ListaPacientesComponent>;
    let el: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ListaPacientesComponent],
            providers: [
                provideRouter([]),
                { provide: PacienteService, useValue: { buscar: vi.fn().mockReturnValue(of([])) } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ListaPacientesComponent);
        await fixture.whenStable();
        fixture.detectChanges();
        el = fixture.nativeElement as HTMLElement;
    });

    it('should show empty state when the service returns no patients', () => {
        const vazia = el.querySelector<HTMLElement>('.tabela-vazia');
        expect(vazia).toBeTruthy();
        expect(vazia?.textContent).toContain('Nenhum paciente encontrado.');
    });

    it('should show 0 patients in the subtitle', () => {
        const subtitulo = el.querySelector<HTMLElement>('.cabecalho-subtitulo');
        expect(subtitulo?.textContent).toContain('0 pacientes cadastrados');
    });
});
