import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCargoComponent } from './registrar-cargo.component';

describe('RegistrarCargoComponent', () => {
  let component: RegistrarCargoComponent;
  let fixture: ComponentFixture<RegistrarCargoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarCargoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarCargoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
