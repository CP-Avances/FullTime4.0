import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerRegimenComponent } from './ver-regimen.component';

describe('VerRegimenComponent', () => {
  let component: VerRegimenComponent;
  let fixture: ComponentFixture<VerRegimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerRegimenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerRegimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
