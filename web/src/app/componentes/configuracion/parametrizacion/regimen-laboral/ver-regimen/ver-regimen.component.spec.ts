import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerRegimenComponent } from './ver-regimen.component';

describe('VerRegimenComponent', () => {
  let component: VerRegimenComponent;
  let fixture: ComponentFixture<VerRegimenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerRegimenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerRegimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
