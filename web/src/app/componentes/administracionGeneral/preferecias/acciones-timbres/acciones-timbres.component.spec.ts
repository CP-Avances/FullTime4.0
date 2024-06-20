import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccionesTimbresComponent } from './acciones-timbres.component';

describe('AccionesTimbresComponent', () => {
  let component: AccionesTimbresComponent;
  let fixture: ComponentFixture<AccionesTimbresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccionesTimbresComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccionesTimbresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
