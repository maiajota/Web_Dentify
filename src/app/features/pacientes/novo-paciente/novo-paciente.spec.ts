import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { NovoPacienteComponent } from './novo-paciente';
import { PacienteService } from '../paciente.service';
import { ConvenioService } from '../../convenios/convenio.service';

const DADOS_VALIDOS = {
    nome: 'Maria Laura Maia',
    cpf: '123.456.789-00',
    telefone: '(11) 91234-5678',
    dataNascimento: new Date('1990-01-15'),
    logradouro: 'Rua das Flores, 100',
    convenios: [],
};

async function criarFixture(adicionarRetorno = of({})) {
    const pacientesService = { adicionar: vi.fn().mockReturnValue(adicionarRetorno) };

    await TestBed.configureTestingModule({
        imports: [NovoPacienteComponent],
        providers: [
            provideRouter([]),
            { provide: PacienteService, useValue: pacientesService },
            { provide: ConvenioService, useValue: { buscar: () => of([]) } },
            MessageService,
        ],
    })
        .overrideComponent(NovoPacienteComponent, {
            // remove component-level MessageService so Toast uses the module-level one
            set: { providers: [] },
        })
        .compileComponents();

    const fixture = TestBed.createComponent(NovoPacienteComponent);
    const component = fixture.componentInstance;
    const router = TestBed.inject(Router);
    const messageService = TestBed.inject(MessageService);
    vi.spyOn(messageService, 'add');
    const el = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    return { fixture, component, router, el, pacientesService, messageService };
}

describe('NovoPacienteComponent', () => {
    let fixture: ComponentFixture<NovoPacienteComponent>;
    let component: NovoPacienteComponent;
    let pacientesService: { adicionar: ReturnType<typeof vi.fn> };
    let messageService: MessageService;
    let router: Router;
    let el: HTMLElement;

    beforeEach(async () => {
        ({ fixture, component, router, el, pacientesService, messageService } = await criarFixture());
    });

    it('deve criar o componente', () => {
        expect(component).toBeTruthy();
    });

    describe('renderização', () => {
        it('deve renderizar todos os campos do formulário', () => {
            expect(el.querySelector('#nome')).toBeTruthy();
            expect(el.querySelector('#cpf')).toBeTruthy();
            expect(el.querySelector('#telefone')).toBeTruthy();
            expect(el.querySelector('#logradouro')).toBeTruthy();
        });

        it('deve iniciar com salvando igual a false', () => {
            expect(component.salvando()).toBe(false);
        });

        it('deve desabilitar o botão salvar quando o formulário é inválido', () => {
            const botao = el.querySelector<HTMLButtonElement>('button[type="submit"]');
            expect(botao?.disabled).toBe(true);
        });

        it('deve habilitar o botão salvar quando o formulário é válido', () => {
            component.form.setValue(DADOS_VALIDOS);
            fixture.detectChanges();
            const botao = el.querySelector<HTMLButtonElement>('button[type="submit"]');
            expect(botao?.disabled).toBe(false);
        });
    });

    describe('validação', () => {
        it('deve ser inválido quando os campos estão vazios', () => {
            expect(component.form.invalid).toBe(true);
        });

        it('deve ser válido quando todos os campos estão preenchidos', () => {
            component.form.setValue(DADOS_VALIDOS);
            expect(component.form.valid).toBe(true);
        });

        it('deve ser inválido quando qualquer campo obrigatório está ausente', () => {
            component.form.patchValue({ nome: 'João' });
            expect(component.form.invalid).toBe(true);
        });
    });

    describe('salvar()', () => {
        it('não deve chamar o serviço se o formulário é inválido', () => {
            component.salvar();
            expect(pacientesService.adicionar).not.toHaveBeenCalled();
        });

        it('não deve chamar o serviço se já está salvando', () => {
            component.form.setValue(DADOS_VALIDOS);
            component.salvando.set(true);
            component.salvar();
            expect(pacientesService.adicionar).not.toHaveBeenCalled();
        });

        it('deve remover a máscara do CPF antes de enviar', () => {
            component.form.setValue(DADOS_VALIDOS);
            component.salvar();
            const [dados] = pacientesService.adicionar.mock.calls[0];
            expect(dados.cpf).toBe('12345678900');
        });

        it('deve remover a máscara do telefone antes de enviar', () => {
            component.form.setValue(DADOS_VALIDOS);
            component.salvar();
            const [dados] = pacientesService.adicionar.mock.calls[0];
            expect(dados.telefone).toBe('11912345678');
        });

        it('deve chamar adicionar() com os dados corretos', () => {
            component.form.setValue(DADOS_VALIDOS);
            component.salvar();
            expect(pacientesService.adicionar).toHaveBeenCalledWith({
                nome: 'Maria Laura Maia',
                cpf: '12345678900',
                telefone: '11912345678',
                dataNascimento: DADOS_VALIDOS.dataNascimento,
                logradouro: 'Rua das Flores, 100',
                convenios: undefined,
            });
        });

        it('deve definir salvando como true durante o salvamento', () => {
            const pendente$ = new Subject<void>();
            pacientesService.adicionar.mockReturnValue(pendente$);
            component.form.setValue(DADOS_VALIDOS);
            component.salvar();
            expect(component.salvando()).toBe(true);
            pendente$.complete();
        });

        it('deve exibir toast de sucesso ao salvar', () => {
            component.form.setValue(DADOS_VALIDOS);
            component.salvar();
            expect(messageService.add).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success' }),
            );
        });

        it('deve navegar para /pacientes após 2 segundos do sucesso', () => {
            vi.useFakeTimers();
            const navegar = vi.spyOn(router, 'navigate');
            component.form.setValue(DADOS_VALIDOS);
            component.salvar();
            vi.advanceTimersByTime(2000);
            expect(navegar).toHaveBeenCalledWith(['/pacientes']);
            vi.useRealTimers();
        });

        it('deve redefinir salvando para false em caso de erro', () => {
            pacientesService.adicionar.mockReturnValue(throwError(() => new Error('Falha')));
            component.form.setValue(DADOS_VALIDOS);
            component.salvar();
            expect(component.salvando()).toBe(false);
        });
    });
});