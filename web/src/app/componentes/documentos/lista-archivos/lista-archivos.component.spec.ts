import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaArchivosComponent } from './lista-archivos.component';

describe('ListaArchivosComponent', () => {
  let component: ListaArchivosComponent;
  let fixture: ComponentFixture<ListaArchivosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaArchivosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
