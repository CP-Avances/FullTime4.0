import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarNotiAutorizacionesComponent } from './listar-noti-autorizaciones.component';

describe('ListarNotiAutorizacionesComponent', () => {
  let component: ListarNotiAutorizacionesComponent;
  let fixture: ComponentFixture<ListarNotiAutorizacionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarNotiAutorizacionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarNotiAutorizacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
