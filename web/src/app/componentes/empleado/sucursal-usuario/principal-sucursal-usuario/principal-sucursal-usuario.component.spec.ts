import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalSucursalUsuarioComponent } from './principal-sucursal-usuario.component';

describe('PrincipalSucursalUsuarioComponent', () => {
  let component: PrincipalSucursalUsuarioComponent;
  let fixture: ComponentFixture<PrincipalSucursalUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrincipalSucursalUsuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalSucursalUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
