import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscapacidadComponent } from './discapacidad.component';

describe('DiscapacidadComponent', () => {
  let component: DiscapacidadComponent;
  let fixture: ComponentFixture<DiscapacidadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscapacidadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscapacidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
