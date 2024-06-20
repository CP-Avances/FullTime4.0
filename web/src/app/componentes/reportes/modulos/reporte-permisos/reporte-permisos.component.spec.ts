import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePermisosComponent } from './reporte-permisos.component';

describe('ReportePermisosComponent', () => {
  let component: ReportePermisosComponent;
  let fixture: ComponentFixture<ReportePermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportePermisosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportePermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
