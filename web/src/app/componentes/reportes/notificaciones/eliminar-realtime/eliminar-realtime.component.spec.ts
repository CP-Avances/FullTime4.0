import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarRealtimeComponent } from './eliminar-realtime.component';

describe('EliminarRealtimeComponent', () => {
  let component: EliminarRealtimeComponent;
  let fixture: ComponentFixture<EliminarRealtimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EliminarRealtimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarRealtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
