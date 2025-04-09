import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraExtraRealComponent } from './hora-extra-real.component';

describe('HoraExtraRealComponent', () => {
  let component: HoraExtraRealComponent;
  let fixture: ComponentFixture<HoraExtraRealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoraExtraRealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoraExtraRealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
