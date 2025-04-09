import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerSucursalComponent } from './ver-sucursal.component';

describe('VerSucursalComponent', () => {
  let component: VerSucursalComponent;
  let fixture: ComponentFixture<VerSucursalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerSucursalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
