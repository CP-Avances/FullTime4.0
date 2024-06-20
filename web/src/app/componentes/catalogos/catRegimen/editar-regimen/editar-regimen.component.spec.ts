import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarRegimenComponent } from './editar-regimen.component';

describe('EditarRegimenComponent', () => {
  let component: EditarRegimenComponent;
  let fixture: ComponentFixture<EditarRegimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarRegimenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarRegimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
