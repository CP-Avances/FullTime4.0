import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarEstadoVacacionAutoriacionComponent } from './editar-estado-vacacion-autoriacion.component';

describe('EditarEstadoVacacionAutoriacionComponent', () => {
  let component: EditarEstadoVacacionAutoriacionComponent;
  let fixture: ComponentFixture<EditarEstadoVacacionAutoriacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarEstadoVacacionAutoriacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarEstadoVacacionAutoriacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
