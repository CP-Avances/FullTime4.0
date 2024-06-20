import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraExtraEmpleadoComponent } from './hora-extra-empleado.component';

describe('HoraExtraEmpleadoComponent', () => {
  let component: HoraExtraEmpleadoComponent;
  let fixture: ComponentFixture<HoraExtraEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoraExtraEmpleadoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoraExtraEmpleadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
