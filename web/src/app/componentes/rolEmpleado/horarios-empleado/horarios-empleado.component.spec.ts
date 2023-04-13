import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosEmpleadoComponent } from './horarios-empleado.component';

describe('HorariosEmpleadoComponent', () => {
  let component: HorariosEmpleadoComponent;
  let fixture: ComponentFixture<HorariosEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorariosEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorariosEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
