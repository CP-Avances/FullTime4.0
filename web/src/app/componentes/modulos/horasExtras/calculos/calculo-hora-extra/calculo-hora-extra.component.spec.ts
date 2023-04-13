import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculoHoraExtraComponent } from './calculo-hora-extra.component';

describe('CalculoHoraExtraComponent', () => {
  let component: CalculoHoraExtraComponent;
  let fixture: ComponentFixture<CalculoHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalculoHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculoHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
