import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotiAutorizacionesComponent } from './noti-autorizaciones.component';

describe('NotiAutorizacionesComponent', () => {
  let component: NotiAutorizacionesComponent;
  let fixture: ComponentFixture<NotiAutorizacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotiAutorizacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotiAutorizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
