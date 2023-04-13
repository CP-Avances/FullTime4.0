import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudVacacionComponent } from './solicitud-vacacion.component';

describe('SolicitudVacacionComponent', () => {
  let component: SolicitudVacacionComponent;
  let fixture: ComponentFixture<SolicitudVacacionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudVacacionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolicitudVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
