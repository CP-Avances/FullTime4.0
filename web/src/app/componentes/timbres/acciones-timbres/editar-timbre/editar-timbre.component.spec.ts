import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTimbreComponent } from './editar-timbre.component';

describe('EditarTimbreComponent', () => {
  let component: EditarTimbreComponent;
  let fixture: ComponentFixture<EditarTimbreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarTimbreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
