import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarAniversarioComponent } from './registrar-aniversario.component';

describe('RegistrarAniversarioComponent', () => {
  let component: RegistrarAniversarioComponent;
  let fixture: ComponentFixture<RegistrarAniversarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrarAniversarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarAniversarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
