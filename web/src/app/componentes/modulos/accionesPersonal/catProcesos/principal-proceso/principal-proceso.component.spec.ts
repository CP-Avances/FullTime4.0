import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalProcesoComponent } from './principal-proceso.component';

describe('PrincipalProcesoComponent', () => {
  let component: PrincipalProcesoComponent;
  let fixture: ComponentFixture<PrincipalProcesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrincipalProcesoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrincipalProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
