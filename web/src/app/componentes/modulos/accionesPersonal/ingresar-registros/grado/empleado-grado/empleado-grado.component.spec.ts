import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoGradoComponent } from './empleado-grado.component';

describe('EmpleadoGradoComponent', () => {
  let component: EmpleadoGradoComponent;
  let fixture: ComponentFixture<EmpleadoGradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpleadoGradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadoGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
