import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmplCargosComponent } from './empl-cargos.component';

describe('EmplCargosComponent', () => {
  let component: EmplCargosComponent;
  let fixture: ComponentFixture<EmplCargosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmplCargosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmplCargosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
