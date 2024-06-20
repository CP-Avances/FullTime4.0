import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoVacunaComponent } from './tipo-vacuna.component';

describe('TipoVacunaComponent', () => {
  let component: TipoVacunaComponent;
  let fixture: ComponentFixture<TipoVacunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoVacunaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoVacunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
