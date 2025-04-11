import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarRegistrosComponent } from './ingresar-registros.component';

describe('IngresarRegistrosComponent', () => {
  let component: IngresarRegistrosComponent;
  let fixture: ComponentFixture<IngresarRegistrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IngresarRegistrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarRegistrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
