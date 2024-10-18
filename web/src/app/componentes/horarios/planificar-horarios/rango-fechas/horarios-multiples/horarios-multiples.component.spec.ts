import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosMultiplesComponent } from './horarios-multiples.component';

describe('HorariosMultiplesComponent', () => {
  let component: HorariosMultiplesComponent;
  let fixture: ComponentFixture<HorariosMultiplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorariosMultiplesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorariosMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
