import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarVacacionesComponent } from './registrar-vacaciones.component';

describe('RegistrarVacacionesComponent', () => {
  let component: RegistrarVacacionesComponent;
  let fixture: ComponentFixture<RegistrarVacacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarVacacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarVacacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
