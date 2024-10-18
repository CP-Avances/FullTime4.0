import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarRelojesComponent } from './listar-relojes.component';

describe('ListarRelojesComponent', () => {
  let component: ListarRelojesComponent;
  let fixture: ComponentFixture<ListarRelojesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListarRelojesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarRelojesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
