import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarGradoComponent } from './registrar-grado.component';

describe('RegistrarGradoComponent', () => {
  let component: RegistrarGradoComponent;
  let fixture: ComponentFixture<RegistrarGradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarGradoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarGradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
