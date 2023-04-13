import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarEmpleProcesoComponent } from './registrar-emple-proceso.component';

describe('RegistrarEmpleProcesoComponent', () => {
  let component: RegistrarEmpleProcesoComponent;
  let fixture: ComponentFixture<RegistrarEmpleProcesoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistrarEmpleProcesoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrarEmpleProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
