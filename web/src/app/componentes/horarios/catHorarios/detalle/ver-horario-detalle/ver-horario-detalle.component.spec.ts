import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerHorarioDetalleComponent } from './ver-horario-detalle.component';

describe('VerHorarioDetalleComponent', () => {
  let component: VerHorarioDetalleComponent;
  let fixture: ComponentFixture<VerHorarioDetalleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerHorarioDetalleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerHorarioDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
