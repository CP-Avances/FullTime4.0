import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarNacionalidadComponent } from './registrar-nacionalidad.component';

describe('RegistrarNacionalidadComponent', () => {
  let component: RegistrarNacionalidadComponent;
  let fixture: ComponentFixture<RegistrarNacionalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarNacionalidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarNacionalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
