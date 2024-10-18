import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroDiscapacidadComponent } from './registrar-discapacidad.component';

describe('RegistroModalidadComponent', () => {
  let component: RegistroDiscapacidadComponent;
  let fixture: ComponentFixture<RegistroDiscapacidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroDiscapacidadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroDiscapacidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
