import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAlbum, LucideLogOut, LucideUserPlus, LucideUsers } from '@lucide/angular';
import { AuthService } from '../../features/auth/auth.service';

@Component({
    selector: 'app-layout-principal',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        LucideAlbum,
        LucideUsers,
        LucideUserPlus,
        LucideLogOut,
    ],
    templateUrl: './layout-principal.html',
    styleUrl: './layout-principal.scss',
})
export class LayoutPrincipalComponent {
    private authService = inject(AuthService);

    sair(evento: Event): void {
        evento.preventDefault();
        this.authService.logout().subscribe();
    }
}
