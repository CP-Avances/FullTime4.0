import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorizaEmpleadoComponent } from './autoriza-empleado.component';

describe('AutorizaEmpleadoComponent', () => {
  let component: AutorizaEmpleadoComponent;
  let fixture: ComponentFixture<AutorizaEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutorizaEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorizaEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
