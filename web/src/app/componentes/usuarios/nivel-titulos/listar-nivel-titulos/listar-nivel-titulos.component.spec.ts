import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarNivelTitulosComponent } from './listar-nivel-titulos.component';

describe('ListarNivelTitulosComponent', () => {
  let component: ListarNivelTitulosComponent;
  let fixture: ComponentFixture<ListarNivelTitulosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarNivelTitulosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarNivelTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
