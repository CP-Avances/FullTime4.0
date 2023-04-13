import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraExtraRealComponent } from './hora-extra-real.component';

describe('HoraExtraRealComponent', () => {
  let component: HoraExtraRealComponent;
  let fixture: ComponentFixture<HoraExtraRealComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HoraExtraRealComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HoraExtraRealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
