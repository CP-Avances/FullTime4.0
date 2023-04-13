import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegimenComponent } from './regimen.component';

describe('RegimenComponent', () => {
  let component: RegimenComponent;
  let fixture: ComponentFixture<RegimenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegimenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
