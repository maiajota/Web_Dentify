import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthService } from '../../features/auth/auth.service';
import { LayoutPrincipalComponent } from './layout-principal';

describe('LayoutPrincipalComponent', () => {
  let component: LayoutPrincipalComponent;
  let fixture: ComponentFixture<LayoutPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutPrincipalComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn().mockReturnValue(of(undefined)) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutPrincipalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
