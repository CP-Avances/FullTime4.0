import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalProvinciaComponent } from './principal-provincia.component';

describe('PrincipalProvinciaComponent', () => {
  let component: PrincipalProvinciaComponent;
  let fixture: ComponentFixture<PrincipalProvinciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrincipalProvinciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalProvinciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
