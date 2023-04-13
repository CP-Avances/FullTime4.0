import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoHoraExtraComponent } from './estado-hora-extra.component';

describe('EstadoHoraExtraComponent', () => {
  let component: EstadoHoraExtraComponent;
  let fixture: ComponentFixture<EstadoHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EstadoHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EstadoHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
