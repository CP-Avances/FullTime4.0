import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarTitulosComponent } from './listar-titulos.component';

describe('ListarTitulosComponent', () => {
  let component: ListarTitulosComponent;
  let fixture: ComponentFixture<ListarTitulosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarTitulosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarTitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
