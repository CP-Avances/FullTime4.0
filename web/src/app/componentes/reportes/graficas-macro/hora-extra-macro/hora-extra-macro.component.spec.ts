import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoraExtraMacroComponent } from './hora-extra-macro.component';

describe('HoraExtraMacroComponent', () => {
  let component: HoraExtraMacroComponent;
  let fixture: ComponentFixture<HoraExtraMacroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoraExtraMacroComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoraExtraMacroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
