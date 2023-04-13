import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutorizacionesComponent } from './autorizaciones.component';

describe('AutorizacionesComponent', () => {
  let component: AutorizacionesComponent;
  let fixture: ComponentFixture<AutorizacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutorizacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutorizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
