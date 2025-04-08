import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoGrupoComponent } from './empleado-grupo.component';

describe('EmpleadoGrupoComponent', () => {
  let component: EmpleadoGrupoComponent;
  let fixture: ComponentFixture<EmpleadoGrupoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmpleadoGrupoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmpleadoGrupoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
