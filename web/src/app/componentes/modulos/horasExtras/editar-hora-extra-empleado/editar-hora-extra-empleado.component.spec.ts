import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarHoraExtraEmpleadoComponent } from './editar-hora-extra-empleado.component';

describe('EditarHoraExtraEmpleadoComponent', () => {
  let component: EditarHoraExtraEmpleadoComponent;
  let fixture: ComponentFixture<EditarHoraExtraEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarHoraExtraEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarHoraExtraEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
