import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorizaSolicitudComponent } from './autoriza-solicitud.component';

describe('AutorizaSolicitudComponent', () => {
  let component: AutorizaSolicitudComponent;
  let fixture: ComponentFixture<AutorizaSolicitudComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutorizaSolicitudComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorizaSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
