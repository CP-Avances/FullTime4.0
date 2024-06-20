import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorizaEmpleadoComponent } from './autoriza-empleado.component';

describe('AutorizaEmpleadoComponent', () => {
  let component: AutorizaEmpleadoComponent;
  let fixture: ComponentFixture<AutorizaEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutorizaEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutorizaEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
