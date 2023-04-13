import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPlanHoraExtraComponent } from './lista-plan-hora-extra.component';

describe('ListaPlanHoraExtraComponent', () => {
  let component: ListaPlanHoraExtraComponent;
  let fixture: ComponentFixture<ListaPlanHoraExtraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaPlanHoraExtraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaPlanHoraExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
