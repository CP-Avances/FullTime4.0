import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermisosMultiplesComponent } from './permisos-multiples.component';

describe('PermisosMultiplesComponent', () => {
  let component: PermisosMultiplesComponent;
  let fixture: ComponentFixture<PermisosMultiplesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermisosMultiplesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermisosMultiplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
