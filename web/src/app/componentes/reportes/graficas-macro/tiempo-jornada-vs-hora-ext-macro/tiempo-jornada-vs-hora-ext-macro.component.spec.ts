import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiempoJornadaVsHoraExtMacroComponent } from './tiempo-jornada-vs-hora-ext-macro.component';

describe('TiempoJornadaVsHoraExtMacroComponent', () => {
  let component: TiempoJornadaVsHoraExtMacroComponent;
  let fixture: ComponentFixture<TiempoJornadaVsHoraExtMacroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiempoJornadaVsHoraExtMacroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiempoJornadaVsHoraExtMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
