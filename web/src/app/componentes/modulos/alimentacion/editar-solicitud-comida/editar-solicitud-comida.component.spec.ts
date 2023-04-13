import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSolicitudComidaComponent } from './editar-solicitud-comida.component';

describe('EditarSolicitudComidaComponent', () => {
  let component: EditarSolicitudComidaComponent;
  let fixture: ComponentFixture<EditarSolicitudComidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarSolicitudComidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarSolicitudComidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
