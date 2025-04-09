import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarPeriodoVacacionesComponent } from './editar-periodo-vacaciones.component';

describe('EditarPeriodoVacacionesComponent', () => {
  let component: EditarPeriodoVacacionesComponent;
  let fixture: ComponentFixture<EditarPeriodoVacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarPeriodoVacacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarPeriodoVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
