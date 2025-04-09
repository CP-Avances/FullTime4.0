import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorizaSolicitudComponent } from './autoriza-solicitud.component';

describe('AutorizaSolicitudComponent', () => {
  let component: AutorizaSolicitudComponent;
  let fixture: ComponentFixture<AutorizaSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutorizaSolicitudComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutorizaSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
