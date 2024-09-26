import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerConfiguracionTimbreComponent } from './ver-configuracion-timbre.component';

describe('VerConfiguracionTimbreComponent', () => {
  let component: VerConfiguracionTimbreComponent;
  let fixture: ComponentFixture<VerConfiguracionTimbreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerConfiguracionTimbreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerConfiguracionTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
