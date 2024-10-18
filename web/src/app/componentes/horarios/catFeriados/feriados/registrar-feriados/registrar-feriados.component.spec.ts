import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarFeriadosComponent } from './registrar-feriados.component';

describe('RegistrarFeriadosComponent', () => {
  let component: RegistrarFeriadosComponent;
  let fixture: ComponentFixture<RegistrarFeriadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarFeriadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarFeriadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
