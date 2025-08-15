import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarConfigurarVacacionComponent } from './registrar-configurar-vacacion.component';

describe('RegistrarConfigurarVacacionComponent', () => {
  let component: RegistrarConfigurarVacacionComponent;
  let fixture: ComponentFixture<RegistrarConfigurarVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarConfigurarVacacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarConfigurarVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
