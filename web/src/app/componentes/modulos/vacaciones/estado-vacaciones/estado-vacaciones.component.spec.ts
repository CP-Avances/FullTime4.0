import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoVacacionesComponent } from './estado-vacaciones.component';

describe('EstadoVacacionesComponent', () => {
  let component: EstadoVacacionesComponent;
  let fixture: ComponentFixture<EstadoVacacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EstadoVacacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
