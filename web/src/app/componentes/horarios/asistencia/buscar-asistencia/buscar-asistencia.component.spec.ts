import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarAsistenciaComponent } from './buscar-asistencia.component';

describe('BuscarAsistenciaComponent', () => {
  let component: BuscarAsistenciaComponent;
  let fixture: ComponentFixture<BuscarAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarAsistenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
