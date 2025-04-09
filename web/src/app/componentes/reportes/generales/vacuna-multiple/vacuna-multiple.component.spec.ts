import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacunaMultipleComponent } from './vacuna-multiple.component';

describe('VacunaMultipleComponent', () => {
  let component: VacunaMultipleComponent;
  let fixture: ComponentFixture<VacunaMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VacunaMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacunaMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
