import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroMultipleProcesoComponent } from './registro-multiple-proceso.component';

describe('RegistroMultipleProcesoComponent', () => {
  let component: RegistroMultipleProcesoComponent;
  let fixture: ComponentFixture<RegistroMultipleProcesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroMultipleProcesoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroMultipleProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
