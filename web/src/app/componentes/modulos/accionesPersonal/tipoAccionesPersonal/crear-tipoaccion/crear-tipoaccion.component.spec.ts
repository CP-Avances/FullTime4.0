import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTipoaccionComponent } from './crear-tipoaccion.component';

describe('CrearTipoaccionComponent', () => {
  let component: CrearTipoaccionComponent;
  let fixture: ComponentFixture<CrearTipoaccionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearTipoaccionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearTipoaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
