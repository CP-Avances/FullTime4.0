import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoProcesoComponent } from './empleado-proceso.component';

describe('EmpleadoProcesoComponent', () => {
  let component: EmpleadoProcesoComponent;
  let fixture: ComponentFixture<EmpleadoProcesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpleadoProcesoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadoProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
