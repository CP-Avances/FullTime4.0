import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroMultipleGradoComponent } from './registro-multiple-grado.component';

describe('RegistroMultipleGradoComponent', () => {
  let component: RegistroMultipleGradoComponent;
  let fixture: ComponentFixture<RegistroMultipleGradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroMultipleGradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroMultipleGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
