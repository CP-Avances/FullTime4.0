import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSolicitudComidaComponent } from './editar-solicitud-comida.component';

describe('EditarSolicitudComidaComponent', () => {
  let component: EditarSolicitudComidaComponent;
  let fixture: ComponentFixture<EditarSolicitudComidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarSolicitudComidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarSolicitudComidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
