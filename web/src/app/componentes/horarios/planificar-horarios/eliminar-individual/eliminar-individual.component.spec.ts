import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarIndividualComponent } from './eliminar-individual.component';

describe('EliminarIndividualComponent', () => {
  let component: EliminarIndividualComponent;
  let fixture: ComponentFixture<EliminarIndividualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EliminarIndividualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarIndividualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
