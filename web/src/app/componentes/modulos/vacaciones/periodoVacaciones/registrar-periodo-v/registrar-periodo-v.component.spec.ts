import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarPeriodoVComponent } from './registrar-periodo-v.component';

describe('RegistrarPeriodoVComponent', () => {
  let component: RegistrarPeriodoVComponent;
  let fixture: ComponentFixture<RegistrarPeriodoVComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarPeriodoVComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarPeriodoVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
