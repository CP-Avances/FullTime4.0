import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarCargoComponent } from './editar-cargo.component';

describe('EditarCargoComponent', () => {
  let component: EditarCargoComponent;
  let fixture: ComponentFixture<EditarCargoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarCargoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
