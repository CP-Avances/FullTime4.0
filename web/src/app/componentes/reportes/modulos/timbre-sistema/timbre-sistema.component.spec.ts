import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbreSistemaComponent } from './timbre-sistema.component';

describe('TimbreSistemaComponent', () => {
  let component: TimbreSistemaComponent;
  let fixture: ComponentFixture<TimbreSistemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimbreSistemaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimbreSistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
