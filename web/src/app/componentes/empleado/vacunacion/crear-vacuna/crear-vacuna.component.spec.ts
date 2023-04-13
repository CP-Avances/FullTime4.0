import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearVacunaComponent } from './crear-vacuna.component';

describe('CrearVacunaComponent', () => {
  let component: CrearVacunaComponent;
  let fixture: ComponentFixture<CrearVacunaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrearVacunaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearVacunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
