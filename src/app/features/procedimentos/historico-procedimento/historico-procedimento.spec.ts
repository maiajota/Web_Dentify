import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { HistoricoProcedimentoComponent } from './historico-procedimento';
import { PacienteService } from '../../pacientes/paciente.service';
import { ProcedimentoService } from '../procedimento.service';
import { ConvenioService } from '../../convenios/convenio.service';
import { PagedResult } from '../../../core/models/paged-result.model';
import { Procedimento, ProcedimentoRequest } from '../procedimento.model';
import { PacienteDetalhes } from '../../pacientes/paciente.model';
import { Convenio } from '../../convenios/convenio.model';

const PACIENTE_MOCK: PacienteDetalhes = {
    guid: '018e6c8a-0001-7b4a-9c5a-000000000001',
    nome: 'João Victor',
    cpf: '12345678900',
    telefone: '11911111111',
    dataNascimento: new Date('1990-01-15'),
    logradouro: 'Rua A, 100',
    quantidadeProcedimentos: 2,
    convenios: [],
};

const PROCEDIMENTOS_MOCK: Procedimento[] = [
    {
        guid: '018e6c8a-0001-7b4a-9c5a-000000000002',
        descricao: 'Limpeza dental',
        convenioNome: 'Unimed',
        convenioGuid: '018e6c8a-0001-7b4a-9c5a-000000000010',
        dataProcedimento: '2024-01-10' as unknown as Date,
    },
    {
        guid: '018e6c8a-0001-7b4a-9c5a-000000000003',
        descricao: 'Extração',
        convenioNome: 'Amil',
        convenioGuid: '018e6c8a-0001-7b4a-9c5a-000000000011',
        dataProcedimento: '2024-02-15' as unknown as Date,
    },
];

const CONVENIOS_MOCK: Convenio[] = [
    { guid: '018e6c8a-0001-7b4a-9c5a-000000000010', nome: 'Unimed' },
    { guid: '018e6c8a-0001-7b4a-9c5a-000000000011', nome: 'Amil' },
];

const PAGED_RESULT_MOCK: PagedResult<Procedimento> = {
    data: PROCEDIMENTOS_MOCK,
    pageNumber: 1,
    pageSize: 20,
    totalItems: 2,
    totalPages: 1,
};

type ProcedimentoServiceMock = {
    buscarPorPaciente: ReturnType<typeof vi.fn>;
    adicionar: ReturnType<typeof vi.fn>;
    atualizar: ReturnType<typeof vi.fn>;
    remover: ReturnType<typeof vi.fn>;
};

async function criarFixture(overrides?: {
    pagedResult?: Partial<PagedResult<Procedimento>>;
    paciente?: PacienteDetalhes | null;
}) {
    const pagedResult: PagedResult<Procedimento> = { ...PAGED_RESULT_MOCK, ...overrides?.pagedResult };

    const procedimentoService: ProcedimentoServiceMock = {
        buscarPorPaciente: vi.fn().mockReturnValue(of(pagedResult)),
        adicionar: vi.fn().mockReturnValue(of(undefined)),
        atualizar: vi.fn().mockReturnValue(of(undefined)),
        remover: vi.fn().mockReturnValue(of(undefined)),
    };
    const pacienteService = {
        buscarPorId: vi.fn().mockReturnValue(of(overrides?.paciente ?? PACIENTE_MOCK)),
    };
    const convenioService = {
        buscar: vi.fn().mockReturnValue(of(CONVENIOS_MOCK)),
    };

    await TestBed.configureTestingModule({
        imports: [HistoricoProcedimentoComponent],
        providers: [
            { provide: ActivatedRoute, useValue: { params: of({ id: '018e6c8a-0001-7b4a-9c5a-000000000001' }) } },
            { provide: PacienteService, useValue: pacienteService },
            { provide: ProcedimentoService, useValue: procedimentoService },
            { provide: ConvenioService, useValue: convenioService },
            MessageService,
        ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HistoricoProcedimentoComponent);
    const component = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, component, el, procedimentoService, pacienteService };
}

describe('HistoricoProcedimentoComponent', () => {
    let fixture: ComponentFixture<HistoricoProcedimentoComponent>;
    let component: HistoricoProcedimentoComponent;
    let el: HTMLElement;
    let procedimentoService: ProcedimentoServiceMock;

    beforeEach(async () => {
        ({ fixture, component, el, procedimentoService } = await criarFixture());
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });

    describe('renderização', () => {
        it('deve exibir um item por procedimento', () => {
            const itens = el.querySelectorAll<HTMLElement>('.item-procedimento');
            expect(itens.length).toBe(2);
        });

        it('deve exibir a descrição e o convênio de cada procedimento', () => {
            const itens = el.querySelectorAll<HTMLElement>('.item-procedimento');
            expect(itens[0].textContent).toContain('Limpeza dental');
            expect(itens[0].textContent).toContain('Unimed');
            expect(itens[1].textContent).toContain('Extração');
            expect(itens[1].textContent).toContain('Amil');
        });

        it('deve exibir botões de editar e excluir em cada item', () => {
            const itens = el.querySelectorAll<HTMLElement>('.item-procedimento');
            itens.forEach((item) => {
                expect(item.querySelector('.botao-acao[aria-label="Editar procedimento"]')).not.toBeNull();
                expect(item.querySelector('.botao-acao[aria-label="Excluir procedimento"]')).not.toBeNull();
            });
        });

        it('deve exibir o nome do paciente e a quantidade de procedimentos no subtítulo', () => {
            const subtitulo = el.querySelector<HTMLElement>('.historico-subtitulo');
            expect(subtitulo?.textContent).toContain('João Victor');
            expect(subtitulo?.textContent).toContain('2');
        });
    });

    describe('modal de adição', () => {
        it('deve iniciar com a modal fechada', () => {
            expect(component.modalAberta()).toBe(false);
            expect(el.querySelector('.modal')).toBeNull();
        });

        it('fecharModal deve fechar a modal e limpar o procedimento em edição', () => {
            component.abrirModalEdicao(PROCEDIMENTOS_MOCK[0]);
            fixture.detectChanges();
            component.fecharModal();
            fixture.detectChanges();

            expect(component.modalAberta()).toBe(false);
            expect(component.procedimentoEmEdicao()).toBeNull();
            expect(el.querySelector('.modal')).toBeNull();
        });
    });

    describe('edição', () => {
        const PROC = PROCEDIMENTOS_MOCK[0];

        beforeEach(() => {
            component.abrirModalEdicao(PROC);
            fixture.detectChanges();
        });

        it('deve definir procedimentoEmEdicao com o procedimento selecionado', () => {
            expect(component.procedimentoEmEdicao()).toBe(PROC);
        });

        it('deve preencher o form com os dados do procedimento', () => {
            expect(component.form.get('descricao')?.value).toBe(PROC.descricao);
            expect(component.form.get('convenioGuid')?.value).toBe(PROC.convenioGuid);
        });

        it('deve preencher a data como horário local sem deslocar o dia', () => {
            const data = component.form.get('dataProcedimento')?.value as Date;
            expect(data.getFullYear()).toBe(2024);
            expect(data.getMonth()).toBe(0);
            expect(data.getDate()).toBe(10);
        });

        it('deve abrir a modal', () => {
            expect(component.modalAberta()).toBe(true);
        });

        it('deve exibir o título "Editar Procedimento"', () => {
            const titulo = el.querySelector<HTMLElement>('#modal-titulo');
            expect(titulo?.textContent?.trim()).toBe('Editar Procedimento');
        });

        it('deve chamar atualizar (e não adicionar) ao salvar', () => {
            component.salvar();
            expect(procedimentoService.atualizar).toHaveBeenCalledWith(PROC.guid, expect.objectContaining({
                descricao: PROC.descricao,
                convenioGuid: PROC.convenioGuid,
            }));
            expect(procedimentoService.adicionar).not.toHaveBeenCalled();
        });

        it('deve fechar a modal e recarregar os procedimentos após atualizar com sucesso', async () => {
            const chamadasAntes = procedimentoService.buscarPorPaciente.mock.calls.length;
            component.salvar();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(component.modalAberta()).toBe(false);
            expect(procedimentoService.buscarPorPaciente.mock.calls.length).toBeGreaterThan(chamadasAntes);
        });

        it('deve setar salvando como false em caso de erro ao atualizar', async () => {
            procedimentoService.atualizar.mockReturnValue(throwError(() => new Error('falha')));
            component.salvar();
            await fixture.whenStable();
            expect(component.salvando()).toBe(false);
        });
    });

    describe('salvar (adição)', () => {
        const DATA = new Date('2024-03-10');

        beforeEach(() => {
            component.procedimentoEmEdicao.set(null);
            component.modalAberta.set(true);
            component.form.patchValue({ dataProcedimento: DATA, descricao: 'Consulta', convenioGuid: '018e6c8a-0001-7b4a-9c5a-000000000010' });
        });

        it('não deve chamar o serviço se o form estiver inválido', () => {
            component.form.patchValue({ descricao: '' });
            component.salvar();
            expect(procedimentoService.adicionar).not.toHaveBeenCalled();
        });

        it('não deve chamar o serviço se já estiver salvando', () => {
            component.salvando.set(true);
            component.salvar();
            expect(procedimentoService.adicionar).not.toHaveBeenCalled();
        });

        it('deve chamar adicionar com o payload correto', () => {
            component.salvar();
            expect(procedimentoService.adicionar).toHaveBeenCalledWith({
                dataProcedimento: DATA,
                descricao: 'Consulta',
                convenioGuid: '018e6c8a-0001-7b4a-9c5a-000000000010',
                pacienteGuid: PACIENTE_MOCK.guid,
            });
        });

        it('deve fechar a modal após salvar com sucesso', async () => {
            component.salvar();
            await fixture.whenStable();
            fixture.detectChanges();
            expect(component.modalAberta()).toBe(false);
        });

        it('deve recarregar os procedimentos após salvar com sucesso', async () => {
            const chamadasAntes = procedimentoService.buscarPorPaciente.mock.calls.length;
            component.salvar();
            await fixture.whenStable();
            expect(procedimentoService.buscarPorPaciente.mock.calls.length).toBeGreaterThan(chamadasAntes);
        });

        it('deve setar salvando como false em caso de erro', async () => {
            procedimentoService.adicionar.mockReturnValue(throwError(() => new Error('falha')));
            component.salvar();
            await fixture.whenStable();
            expect(component.salvando()).toBe(false);
        });
    });

    describe('remoção', () => {
        const PROC = PROCEDIMENTOS_MOCK[1];

        it('confirmarRemocao deve definir procedimentoParaRemover', () => {
            component.confirmarRemocao(PROC);
            expect(component.procedimentoParaRemover()).toBe(PROC);
        });

        it('confirmarRemocao deve exibir a modal de confirmação', () => {
            component.confirmarRemocao(PROC);
            fixture.detectChanges();
            expect(el.querySelector('#modal-confirmacao-titulo')).not.toBeNull();
        });

        it('cancelarRemocao deve limpar procedimentoParaRemover e fechar a modal', () => {
            component.confirmarRemocao(PROC);
            fixture.detectChanges();
            component.cancelarRemocao();
            fixture.detectChanges();

            expect(component.procedimentoParaRemover()).toBeNull();
            expect(el.querySelector('#modal-confirmacao-titulo')).toBeNull();
        });

        it('não deve chamar o serviço se já estiver removendo', () => {
            component.confirmarRemocao(PROC);
            component.removendo.set(true);
            component.remover();
            expect(procedimentoService.remover).not.toHaveBeenCalled();
        });

        it('deve chamar remover do service com o guid correto', () => {
            component.confirmarRemocao(PROC);
            component.remover();
            expect(procedimentoService.remover).toHaveBeenCalledWith(PROC.guid);
        });

        it('deve limpar procedimentoParaRemover e recarregar os procedimentos após remover com sucesso', async () => {
            const chamadasAntes = procedimentoService.buscarPorPaciente.mock.calls.length;
            component.confirmarRemocao(PROC);
            component.remover();
            await fixture.whenStable();
            fixture.detectChanges();

            expect(component.procedimentoParaRemover()).toBeNull();
            expect(procedimentoService.buscarPorPaciente.mock.calls.length).toBeGreaterThan(chamadasAntes);
        });

        it('deve setar removendo como false em caso de erro', async () => {
            procedimentoService.remover.mockReturnValue(throwError(() => new Error('falha')));
            component.confirmarRemocao(PROC);
            component.remover();
            await fixture.whenStable();
            expect(component.removendo()).toBe(false);
        });
    });

    describe('filtros', () => {
        it('filtrar com descrição deve passar o param descricao', async () => {
            component.filtros.patchValue({ descricao: 'Limpeza' });
            component.filtrar();
            await fixture.whenStable();

            const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
            expect(request.descricao).toBe('Limpeza');
        });

        it('filtrar com convênios deve passar os guids como array de strings', async () => {
            const guids = [CONVENIOS_MOCK[0].guid, CONVENIOS_MOCK[1].guid];
            component.filtros.patchValue({ convenioGuids: guids });
            component.filtrar();
            await fixture.whenStable();

            const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
            expect(request.convenioGuids).toEqual(guids);
        });

        it('filtrar com período deve passar as datas formatadas como YYYY-MM-DD', async () => {
            const inicio = new Date(Date.UTC(2024, 0, 1));
            const fim = new Date(Date.UTC(2024, 2, 31));
            component.filtros.patchValue({ periodo: [inicio, fim] });
            component.filtrar();
            await fixture.whenStable();

            const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
            expect(request.dataInicio).toBe('2024-01-01');
            expect(request.dataFim).toBe('2024-03-31');
        });

        it('filtrar sem preenchimento não deve incluir campos de filtro', async () => {
            component.filtrar();
            await fixture.whenStable();

            const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
            expect(request.descricao).toBeUndefined();
            expect(request.dataInicio).toBeUndefined();
            expect(request.dataFim).toBeUndefined();
        });

        it('filtrar deve incluir pageNumber e pageSize', async () => {
            component.filtrar();
            await fixture.whenStable();

            const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
            expect(request.pageNumber).toBe(1);
            expect(request.pageSize).toBe(20);
        });

        it('limparFiltros deve resetar o form para os valores padrão', () => {
            component.filtros.patchValue({ descricao: 'teste', convenioGuids: [CONVENIOS_MOCK[0].guid] });
            component.limparFiltros();
            expect(component.filtros.getRawValue()).toEqual({ descricao: '', convenioGuids: [], periodo: null });
        });

        it('limparFiltros deve recarregar sem campos de filtro', async () => {
            component.filtros.patchValue({ descricao: 'teste' });
            component.filtrar();
            component.limparFiltros();
            await fixture.whenStable();

            const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
            expect(request.descricao).toBeUndefined();
            expect(request.convenioGuids).toBeUndefined();
            expect(request.dataInicio).toBeUndefined();
            expect(request.dataFim).toBeUndefined();
        });
    });

    describe('paginação', () => {
        it('não deve exibir a nav quando há apenas uma página', () => {
            expect(el.querySelector('.paginacao')).toBeNull();
        });
    });
});

describe('HistoricoProcedimentoComponent com múltiplas páginas', () => {
    let fixture: ComponentFixture<HistoricoProcedimentoComponent>;
    let component: HistoricoProcedimentoComponent;
    let el: HTMLElement;
    let procedimentoService: ProcedimentoServiceMock;

    beforeEach(async () => {
        ({ fixture, component, el, procedimentoService } = await criarFixture({
            pagedResult: { pageNumber: 1, totalPages: 3, totalItems: 60 },
        }));
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

    it('proximaPagina deve chamar o service com pageNumber incrementado', async () => {
        component.proximaPagina();
        await fixture.whenStable();

        const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
        expect(request.pageNumber).toBe(2);
    });

    it('paginaAnterior não deve chamar o service quando já está na primeira página', async () => {
        const chamadasAntes = procedimentoService.buscarPorPaciente.mock.calls.length;
        component.paginaAnterior();
        await fixture.whenStable();
        expect(procedimentoService.buscarPorPaciente.mock.calls.length).toBe(chamadasAntes);
    });

    it('paginaAnterior deve chamar o service com pageNumber decrementado', async () => {
        component.proximaPagina();
        await fixture.whenStable();
        component.paginaAnterior();
        await fixture.whenStable();

        const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
        expect(request.pageNumber).toBe(1);
    });

    it('proximaPagina não deve chamar o service quando já está na última página', async () => {
        component.proximaPagina();
        await fixture.whenStable();
        component.proximaPagina();
        await fixture.whenStable();

        const chamadasAntes = procedimentoService.buscarPorPaciente.mock.calls.length;
        component.proximaPagina();
        await fixture.whenStable();
        expect(procedimentoService.buscarPorPaciente.mock.calls.length).toBe(chamadasAntes);
    });

    it('filtrar deve resetar para a primeira página', async () => {
        component.proximaPagina();
        await fixture.whenStable();
        component.filtrar();
        await fixture.whenStable();

        const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
        expect(request.pageNumber).toBe(1);
    });

    it('limparFiltros deve resetar para a primeira página', async () => {
        component.proximaPagina();
        await fixture.whenStable();
        component.limparFiltros();
        await fixture.whenStable();

        const request = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as ProcedimentoRequest;
        expect(request.pageNumber).toBe(1);
    });
});

describe('HistoricoProcedimentoComponent na última página', () => {
    let el: HTMLElement;

    beforeEach(async () => {
        ({ el } = await criarFixture({ pagedResult: { pageNumber: 3, totalPages: 3, totalItems: 60 } }));
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

describe('HistoricoProcedimentoComponent sem procedimentos', () => {
    let el: HTMLElement;

    beforeEach(async () => {
        ({ el } = await criarFixture({ pagedResult: { data: [], totalItems: 0 } }));
    });

    it('deve exibir o estado vazio', () => {
        const vazio = el.querySelector<HTMLElement>('.procedimentos-vazios');
        expect(vazio).not.toBeNull();
        expect(vazio?.textContent).toContain('Nenhum procedimento registrado.');
    });
});
