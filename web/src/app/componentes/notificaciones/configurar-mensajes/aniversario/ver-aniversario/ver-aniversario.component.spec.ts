import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerAniversarioComponent } from './ver-aniversario.component';

describe('VerAniversarioComponent', () => {
  let component: VerAniversarioComponent;
  let fixture: ComponentFixture<VerAniversarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerAniversarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerAniversarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
