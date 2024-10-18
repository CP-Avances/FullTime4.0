import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerSucursalComponent } from './ver-sucursal.component';

describe('VerSucursalComponent', () => {
  let component: VerSucursalComponent;
  let fixture: ComponentFixture<VerSucursalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerSucursalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
