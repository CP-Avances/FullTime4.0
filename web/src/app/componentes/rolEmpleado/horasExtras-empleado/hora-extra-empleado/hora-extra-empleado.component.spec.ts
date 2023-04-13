import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraExtraEmpleadoComponent } from './hora-extra-empleado.component';

describe('HoraExtraEmpleadoComponent', () => {
  let component: HoraExtraEmpleadoComponent;
  let fixture: ComponentFixture<HoraExtraEmpleadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoraExtraEmpleadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoraExtraEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
