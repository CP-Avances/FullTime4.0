import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerConfigurarVacacionComponent } from './ver-configurar-vacacion.component';

describe('VerConfigurarVacacionComponent', () => {
  let component: VerConfigurarVacacionComponent;
  let fixture: ComponentFixture<VerConfigurarVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerConfigurarVacacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerConfigurarVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
