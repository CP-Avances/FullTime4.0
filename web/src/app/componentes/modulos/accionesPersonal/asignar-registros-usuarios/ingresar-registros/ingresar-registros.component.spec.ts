import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarProcesosComponent } from './ingresar-registros.component';

describe('IngresarProcesosComponent', () => {
  let component: IngresarProcesosComponent;
  let fixture: ComponentFixture<IngresarProcesosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngresarProcesosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarProcesosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
