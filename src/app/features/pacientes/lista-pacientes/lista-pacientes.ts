import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideClipboardClock, LucideEye, LucidePlus, LucideSearch } from '@lucide/angular';

export interface Paciente {
    id: number;
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    totalProcedimentos: number;
}

@Component({
    selector: 'app-lista-pacientes',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterLink,
        LucidePlus,
        LucideEye,
        LucideSearch,
        LucideClipboardClock,
    ],
    templateUrl: './lista-pacientes.html',
    styleUrl: './lista-pacientes.scss',
})
export class ListaPacientesComponent implements OnInit {
    termoBusca = '';

    pacientes: Paciente[] = [
        {
            id: 1,
            nome: 'Ana Carolina Silva',
            email: 'ana.silva@email.com',
            cpf: '123.456.789-00',
            telefone: '(11) 98765-4321',
            totalProcedimentos: 2,
        },
        {
            id: 2,
            nome: 'Bruno Henrique Costa',
            email: 'bruno.costa@email.com',
            cpf: '987.654.321-00',
            telefone: '(11) 91234-5678',
            totalProcedimentos: 1,
        },
        {
            id: 3,
            nome: 'Carla Mendes Oliveira',
            email: 'carla.mendes@email.com',
            cpf: '456.789.123-00',
            telefone: '(11) 99876-5432',
            totalProcedimentos: 0,
        },
        {
            id: 4,
            nome: 'Daniel Souza Lima',
            email: 'daniel.lima@email.com',
            cpf: '321.654.987-00',
            telefone: '(11) 97654-3210',
            totalProcedimentos: 3,
        },
    ];

    pacientesFiltrados: Paciente[] = [];

    constructor(private roteador: Router) {}

    ngOnInit(): void {
        this.pacientesFiltrados = [...this.pacientes];
    }

    filtrarPacientes(): void {
        const termo = this.termoBusca.toLowerCase().trim();
        this.pacientesFiltrados = this.pacientes.filter(
            (p) => p.nome.toLowerCase().includes(termo) || p.cpf.includes(termo),
        );
    }

    verPaciente(id: number): void {
        this.roteador.navigate(['/pacientes', id]);
    }
}
