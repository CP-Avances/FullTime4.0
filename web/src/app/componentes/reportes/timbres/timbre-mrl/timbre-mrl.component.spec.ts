import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreMrlComponent } from './timbre-mrl.component';

describe('TimbreMrlComponent', () => {
  let component: TimbreMrlComponent;
  let fixture: ComponentFixture<TimbreMrlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimbreMrlComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimbreMrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
