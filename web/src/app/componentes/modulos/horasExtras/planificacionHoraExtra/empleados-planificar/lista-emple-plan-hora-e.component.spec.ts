import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaEmplePlanHoraEComponent } from './lista-emple-plan-hora-e.component';

describe('ListaEmplePlanHoraEComponent', () => {
  let component: ListaEmplePlanHoraEComponent;
  let fixture: ComponentFixture<ListaEmplePlanHoraEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaEmplePlanHoraEComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaEmplePlanHoraEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
