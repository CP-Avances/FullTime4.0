import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarHoraExtraComponent } from './cancelar-hora-extra.component';

describe('CancelarHoraExtraComponent', () => {
  let component: CancelarHoraExtraComponent;
  let fixture: ComponentFixture<CancelarHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelarHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelarHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
