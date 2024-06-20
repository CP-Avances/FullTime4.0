import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRelojComponent } from './editar-reloj.component';

describe('EditarRelojComponent', () => {
  let component: EditarRelojComponent;
  let fixture: ComponentFixture<EditarRelojComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarRelojComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarRelojComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
