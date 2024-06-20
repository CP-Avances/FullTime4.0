import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerVacacionComponent } from './ver-vacacion.component';

describe('VerVacacionComponent', () => {
  let component: VerVacacionComponent;
  let fixture: ComponentFixture<VerVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerVacacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
