import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarParametroComponent } from './listar-parametro.component';

describe('ListarParametroComponent', () => {
  let component: ListarParametroComponent;
  let fixture: ComponentFixture<ListarParametroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarParametroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
