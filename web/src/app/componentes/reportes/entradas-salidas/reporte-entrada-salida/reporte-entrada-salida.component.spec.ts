import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteEntradaSalidaComponent } from './reporte-entrada-salida.component';

describe('ReporteEntradaSalidaComponent', () => {
  let component: ReporteEntradaSalidaComponent;
  let fixture: ComponentFixture<ReporteEntradaSalidaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporteEntradaSalidaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteEntradaSalidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
