import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeAvisosComponent } from './realtime-avisos.component';

describe('RealtimeAvisosComponent', () => {
  let component: RealtimeAvisosComponent;
  let fixture: ComponentFixture<RealtimeAvisosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RealtimeAvisosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealtimeAvisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
