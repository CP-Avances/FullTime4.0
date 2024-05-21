import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarTipoCargoComponent } from './editar-tipo-cargo.component';

describe('EditarTipoCargoComponent', () => {
  let component: EditarTipoCargoComponent;
  let fixture: ComponentFixture<EditarTipoCargoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarTipoCargoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarTipoCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
