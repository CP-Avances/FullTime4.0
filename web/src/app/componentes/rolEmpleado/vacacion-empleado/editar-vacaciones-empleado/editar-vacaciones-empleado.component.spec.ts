import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVacacionesEmpleadoComponent } from './editar-vacaciones-empleado.component';

describe('EditarVacacionesEmpleadoComponent', () => {
  let component: EditarVacacionesEmpleadoComponent;
  let fixture: ComponentFixture<EditarVacacionesEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarVacacionesEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarVacacionesEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
