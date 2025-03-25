import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroInterfazGradoComponent } from './registro-interfaz-grado.component';

describe('RegistroInterfazGradoComponent', () => {
  let component: RegistroInterfazGradoComponent;
  let fixture: ComponentFixture<RegistroInterfazGradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroInterfazGradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroInterfazGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
