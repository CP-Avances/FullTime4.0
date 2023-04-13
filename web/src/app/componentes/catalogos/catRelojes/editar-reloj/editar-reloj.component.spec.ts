import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRelojComponent } from './editar-reloj.component';

describe('EditarRelojComponent', () => {
  let component: EditarRelojComponent;
  let fixture: ComponentFixture<EditarRelojComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarRelojComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarRelojComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
