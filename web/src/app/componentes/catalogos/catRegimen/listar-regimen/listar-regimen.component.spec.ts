import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarRegimenComponent } from './listar-regimen.component';

describe('ListarRegimenComponent', () => {
  let component: ListarRegimenComponent;
  let fixture: ComponentFixture<ListarRegimenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarRegimenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarRegimenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
