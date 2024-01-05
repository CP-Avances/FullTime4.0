import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisDatosComponent } from './analisis-datos.component';

describe('AnalisisDatosComponent', () => {
  let component: AnalisisDatosComponent;
  let fixture: ComponentFixture<AnalisisDatosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnalisisDatosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisisDatosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
