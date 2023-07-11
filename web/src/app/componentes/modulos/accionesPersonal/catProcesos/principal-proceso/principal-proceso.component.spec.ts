import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrincipalProcesoComponent } from './principal-proceso.component';

describe('PrincipalProcesoComponent', () => {
  let component: PrincipalProcesoComponent;
  let fixture: ComponentFixture<PrincipalProcesoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrincipalProcesoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrincipalProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
