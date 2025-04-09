import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarEstadoCivilComponent } from './registrar-estado-civil.component';

describe('RegistrarEstadoCivilComponent', () => {
  let component: RegistrarEstadoCivilComponent;
  let fixture: ComponentFixture<RegistrarEstadoCivilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarEstadoCivilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarEstadoCivilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
