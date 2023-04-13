import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VacacionesEmpleadoComponent } from './vacaciones-empleado.component';

describe('VacacionesEmpleadoComponent', () => {
  let component: VacacionesEmpleadoComponent;
  let fixture: ComponentFixture<VacacionesEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VacacionesEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VacacionesEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
