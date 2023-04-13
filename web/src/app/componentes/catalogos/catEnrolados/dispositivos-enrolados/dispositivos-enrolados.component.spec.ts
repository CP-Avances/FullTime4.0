import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DispositivosEnroladosComponent } from './dispositivos-enrolados.component';

describe('DispositivosEnroladosComponent', () => {
  let component: DispositivosEnroladosComponent;
  let fixture: ComponentFixture<DispositivosEnroladosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DispositivosEnroladosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DispositivosEnroladosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
