import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JornadaVsHoraExtraMacroComponent } from './jornada-vs-hora-extra-macro.component';

describe('JornadaVsHoraExtraMacroComponent', () => {
  let component: JornadaVsHoraExtraMacroComponent;
  let fixture: ComponentFixture<JornadaVsHoraExtraMacroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JornadaVsHoraExtraMacroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JornadaVsHoraExtraMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
