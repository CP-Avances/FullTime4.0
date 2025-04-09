import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmarDesactivadosComponent } from './confirmar-desactivados.component';

describe('ConfirmarDesactivadosComponent', () => {
  let component: ConfirmarDesactivadosComponent;
  let fixture: ComponentFixture<ConfirmarDesactivadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmarDesactivadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmarDesactivadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
