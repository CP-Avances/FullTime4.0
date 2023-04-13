import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosMultiplesComponent } from './horarios-multiples.component';

describe('HorariosMultiplesComponent', () => {
  let component: HorariosMultiplesComponent;
  let fixture: ComponentFixture<HorariosMultiplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorariosMultiplesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorariosMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
