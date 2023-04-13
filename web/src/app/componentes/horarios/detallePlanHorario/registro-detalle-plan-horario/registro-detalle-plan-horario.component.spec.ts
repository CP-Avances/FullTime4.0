import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroDetallePlanHorarioComponent } from './registro-detalle-plan-horario.component';

describe('RegistroDetallePlanHorarioComponent', () => {
  let component: RegistroDetallePlanHorarioComponent;
  let fixture: ComponentFixture<RegistroDetallePlanHorarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroDetallePlanHorarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroDetallePlanHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
