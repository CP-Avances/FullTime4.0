import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteEntradaSalidaComponent } from './reporte-entrada-salida.component';

describe('ReporteEntradaSalidaComponent', () => {
  let component: ReporteEntradaSalidaComponent;
  let fixture: ComponentFixture<ReporteEntradaSalidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteEntradaSalidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteEntradaSalidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
