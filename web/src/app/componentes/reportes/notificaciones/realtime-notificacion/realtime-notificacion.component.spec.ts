import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimeNotificacionComponent } from './realtime-notificacion.component';

describe('RealtimeNotificacionComponent', () => {
  let component: RealtimeNotificacionComponent;
  let fixture: ComponentFixture<RealtimeNotificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RealtimeNotificacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimeNotificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
