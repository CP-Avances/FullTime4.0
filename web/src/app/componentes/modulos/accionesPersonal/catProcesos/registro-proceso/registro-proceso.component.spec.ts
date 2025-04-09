import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroProcesoComponent } from './registro-proceso.component';

describe('RegistroProcesoComponent', () => {
  let component: RegistroProcesoComponent;
  let fixture: ComponentFixture<RegistroProcesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroProcesoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroProcesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
