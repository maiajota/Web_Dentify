import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { HistoricoProcedimentoComponent } from './historico-procedimento';
import { PacienteService } from '../../pacientes/paciente.service';
import { ProcedimentoService } from '../procedimento.service';
import { ConvenioService } from '../../convenios/convenio.service';
import { Procedimento } from '../procedimento.model';
import { PacienteDetalhes } from '../../pacientes/paciente.model';
import { Convenio } from '../../convenios/convenio.model';

const PACIENTE_MOCK: PacienteDetalhes = {
    id: 1,
    nome: 'João Victor',
    cpf: '12345678900',
    telefone: '11911111111',
    dataNascimento: new Date('1990-01-15'),
    logradouro: 'Rua A, 100',
    quantidadeProcedimentos: 2,
};

const PROCEDIMENTOS_MOCK: Procedimento[] = [
    {
        id: 1,
        descricao: 'Limpeza dental',
        convenioNome: 'Unimed',
        convenioId: 1,
        dataProcedimento: '2024-01-10' as unknown as Date,
    },
    {
        id: 2,
        descricao: 'Extração',
        convenioNome: 'Amil',
        convenioId: 2,
        dataProcedimento: '2024-02-15' as unknown as Date,
    },
];

const CONVENIOS_MOCK: Convenio[] = [
    { id: 1, nome: 'Unimed' },
    { id: 2, nome: 'Amil' },
];

type ProcedimentoServiceMock = {
    buscarPorPaciente: ReturnType<typeof vi.fn>;
    adicionar: ReturnType<typeof vi.fn>;
    atualizar: ReturnType<typeof vi.fn>;
    remover: ReturnType<typeof vi.fn>;
};

async function criarFixture(overrides?: {
    procedimentos?: Procedimento[];
    paciente?: PacienteDetalhes | null;
}) {
    const procedimentoService: ProcedimentoServiceMock = {
        buscarPorPaciente: vi.fn().mockReturnValue(of(overrides?.procedimentos ?? PROCEDIMENTOS_MOCK)),
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
            { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
            { provide: PacienteService, useValue: pacienteService },
            { provide: ProcedimentoService, useValue: procedimentoService },
            { provide: ConvenioService, useValue: convenioService },
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

        it('abrirModal deve abrir a modal, resetar o form e limpar o procedimento em edição', () => {
            component.procedimentoEmEdicao.set(PROCEDIMENTOS_MOCK[0]);
            component.form.patchValue({ descricao: 'valor anterior', convenioId: 1 });
            component.abrirModal();
            fixture.detectChanges();

            expect(component.modalAberta()).toBe(true);
            expect(component.procedimentoEmEdicao()).toBeNull();
            expect(el.querySelector('.modal')).not.toBeNull();
            expect(component.form.get('descricao')?.value).toBe('');
            expect(component.form.get('convenioId')?.value).toBeNull();
        });

        it('deve exibir o título "Adicionar Procedimento" ao abrir modal de criação', () => {
            component.abrirModal();
            fixture.detectChanges();

            const titulo = el.querySelector<HTMLElement>('#modal-titulo');
            expect(titulo?.textContent?.trim()).toBe('Adicionar Procedimento');
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
            expect(component.form.get('convenioId')?.value).toBe(PROC.convenioId);
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
            expect(procedimentoService.atualizar).toHaveBeenCalledWith(PROC.id, expect.objectContaining({
                descricao: PROC.descricao,
                convenioId: PROC.convenioId,
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
            component.abrirModal();
            component.form.patchValue({ dataProcedimento: DATA, descricao: 'Consulta', convenioId: 1 });
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
                convenioId: 1,
                pacienteId: 1,
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

        it('deve chamar remover do service com o id correto', () => {
            component.confirmarRemocao(PROC);
            component.remover();
            expect(procedimentoService.remover).toHaveBeenCalledWith(PROC.id);
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
        it('filtrar com descrição deve passar o query param descricao', async () => {
            component.filtros.patchValue({ descricao: 'Limpeza' });
            component.filtrar();
            await fixture.whenStable();

            const params = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as HttpParams;
            expect(params.get('descricao')).toBe('Limpeza');
        });

        it('filtrar com convênios deve passar os query params convenioIds', async () => {
            component.filtros.patchValue({ convenios: [1, 2] });
            component.filtrar();
            await fixture.whenStable();

            const params = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as HttpParams;
            expect(params.getAll('convenioIds')).toEqual(['1', '2']);
        });

        it('filtrar com período deve passar as datas formatadas como YYYY-MM-DD', async () => {
            const inicio = new Date(Date.UTC(2024, 0, 1));
            const fim = new Date(Date.UTC(2024, 2, 31));
            component.filtros.patchValue({ periodo: [inicio, fim] });
            component.filtrar();
            await fixture.whenStable();

            const params = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as HttpParams;
            expect(params.get('dataInicio')).toBe('2024-01-01');
            expect(params.get('dataFim')).toBe('2024-03-31');
        });

        it('filtrar sem preenchimento não deve incluir query params', async () => {
            component.filtrar();
            await fixture.whenStable();

            const params = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as HttpParams;
            expect(params.keys()).toHaveLength(0);
        });

        it('limparFiltros deve resetar o form para os valores padrão', () => {
            component.filtros.patchValue({ descricao: 'teste', convenios: [1] });
            component.limparFiltros();
            expect(component.filtros.getRawValue()).toEqual({ descricao: '', convenios: [], periodo: null });
        });

        it('limparFiltros deve recarregar os procedimentos sem query params', async () => {
            component.filtros.patchValue({ descricao: 'teste' });
            component.filtrar();
            component.limparFiltros();
            await fixture.whenStable();

            const params = procedimentoService.buscarPorPaciente.mock.calls.at(-1)?.[1] as HttpParams;
            expect(params.keys()).toHaveLength(0);
        });
    });
});

describe('HistoricoProcedimentoComponent sem procedimentos', () => {
    let el: HTMLElement;

    beforeEach(async () => {
        ({ el } = await criarFixture({ procedimentos: [] }));
    });

    it('deve exibir o estado vazio', () => {
        const vazio = el.querySelector<HTMLElement>('.procedimentos-vazios');
        expect(vazio).not.toBeNull();
        expect(vazio?.textContent).toContain('Nenhum procedimento registrado.');
    });
});
