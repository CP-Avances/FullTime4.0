import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaArchivosComponent } from './lista-archivos.component';

describe('ListaArchivosComponent', () => {
  let component: ListaArchivosComponent;
  let fixture: ComponentFixture<ListaArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaArchivosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
