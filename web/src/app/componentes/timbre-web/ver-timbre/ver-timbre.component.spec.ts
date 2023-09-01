import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerTimbreComponent } from './ver-timbre.component';

describe('VerTimbreComponent', () => {
  let component: VerTimbreComponent;
  let fixture: ComponentFixture<VerTimbreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerTimbreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
