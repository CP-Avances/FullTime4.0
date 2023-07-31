import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarParametroComponent } from './editar-parametro.component';

describe('EditarParametroComponent', () => {
  let component: EditarParametroComponent;
  let fixture: ComponentFixture<EditarParametroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarParametroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarParametroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
