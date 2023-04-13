import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosEmpleadoComponent } from './datos-empleado.component';

describe('DatosEmpleadoComponent', () => {
  let component: DatosEmpleadoComponent;
  let fixture: ComponentFixture<DatosEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatosEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatosEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
