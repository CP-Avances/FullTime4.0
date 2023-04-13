import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCiudadComponent } from './registrar-ciudad.component';

describe('RegistrarCiudadComponent', () => {
  let component: RegistrarCiudadComponent;
  let fixture: ComponentFixture<RegistrarCiudadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarCiudadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarCiudadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
