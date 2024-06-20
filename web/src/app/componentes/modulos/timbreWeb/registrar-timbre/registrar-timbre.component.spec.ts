import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarTimbreComponent } from './registrar-timbre.component';

describe('RegistrarTimbreComponent', () => {
  let component: RegistrarTimbreComponent;
  let fixture: ComponentFixture<RegistrarTimbreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarTimbreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarTimbreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
