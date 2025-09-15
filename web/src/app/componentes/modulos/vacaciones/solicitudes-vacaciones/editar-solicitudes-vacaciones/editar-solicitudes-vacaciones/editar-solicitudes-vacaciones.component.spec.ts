import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarSolicitudesVacacionesComponent } from './editar-solicitudes-vacaciones.component';

describe('EditarSolicitudesVacacionesComponent', () => {
  let component: EditarSolicitudesVacacionesComponent;
  let fixture: ComponentFixture<EditarSolicitudesVacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarSolicitudesVacacionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarSolicitudesVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
