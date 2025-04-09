import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorUsuarioComponent } from './por-usuario.component';

describe('PorUsuarioComponent', () => {
  let component: PorUsuarioComponent;
  let fixture: ComponentFixture<PorUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PorUsuarioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
