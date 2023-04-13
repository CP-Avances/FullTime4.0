import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDetallePlanHorariosComponent } from './ver-detalle-plan-horarios.component';

describe('VerDetallePlanHorariosComponent', () => {
  let component: VerDetallePlanHorariosComponent;
  let fixture: ComponentFixture<VerDetallePlanHorariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerDetallePlanHorariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerDetallePlanHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
