import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarPeriodoManualComponent } from './generar-periodo-manual.component';

describe('GenerarPeriodoManualComponent', () => {
  let component: GenerarPeriodoManualComponent;
  let fixture: ComponentFixture<GenerarPeriodoManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenerarPeriodoManualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarPeriodoManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
