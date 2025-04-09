import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroProvinciaComponent } from './registro-provincia.component';

describe('RegistroProvinciaComponent', () => {
  let component: RegistroProvinciaComponent;
  let fixture: ComponentFixture<RegistroProvinciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroProvinciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroProvinciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
