import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarSucursalesComponent } from './registrar-sucursales.component';

describe('RegistrarSucursalesComponent', () => {
  let component: RegistrarSucursalesComponent;
  let fixture: ComponentFixture<RegistrarSucursalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarSucursalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarSucursalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
