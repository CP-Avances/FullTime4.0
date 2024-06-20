import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaHorasExtrasComponent } from './lista-horas-extras.component';

describe('ListaHorasExtrasComponent', () => {
  let component: ListaHorasExtrasComponent;
  let fixture: ComponentFixture<ListaHorasExtrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaHorasExtrasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaHorasExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
