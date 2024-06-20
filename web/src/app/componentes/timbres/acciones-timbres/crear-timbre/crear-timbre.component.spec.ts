import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTimbreComponent } from './crear-timbre.component';

describe('CrearTimbreComponent', () => {
  let component: CrearTimbreComponent;
  let fixture: ComponentFixture<CrearTimbreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearTimbreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
