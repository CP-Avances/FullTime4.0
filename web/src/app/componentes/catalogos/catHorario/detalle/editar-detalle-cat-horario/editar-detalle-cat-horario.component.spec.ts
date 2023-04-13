import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarDetalleCatHorarioComponent } from './editar-detalle-cat-horario.component';

describe('EditarDetalleCatHorarioComponent', () => {
  let component: EditarDetalleCatHorarioComponent;
  let fixture: ComponentFixture<EditarDetalleCatHorarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarDetalleCatHorarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarDetalleCatHorarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
