import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraExtraAutorizacionesComponent } from './hora-extra-autorizaciones.component';

describe('HoraExtraAutorizacionesComponent', () => {
  let component: HoraExtraAutorizacionesComponent;
  let fixture: ComponentFixture<HoraExtraAutorizacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoraExtraAutorizacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoraExtraAutorizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
