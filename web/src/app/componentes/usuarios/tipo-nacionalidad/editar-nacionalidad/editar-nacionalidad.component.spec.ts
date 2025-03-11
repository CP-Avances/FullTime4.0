import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarNacionalidadComponent } from './editar-nacionalidad.component';

describe('EditarNacionalidadComponent', () => {
  let component: EditarNacionalidadComponent;
  let fixture: ComponentFixture<EditarNacionalidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarNacionalidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarNacionalidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
