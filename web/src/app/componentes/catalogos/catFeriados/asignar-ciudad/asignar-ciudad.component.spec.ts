import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignarCiudadComponent } from './asignar-ciudad.component';

describe('AsignarCiudadComponent', () => {
  let component: AsignarCiudadComponent;
  let fixture: ComponentFixture<AsignarCiudadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsignarCiudadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarCiudadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
