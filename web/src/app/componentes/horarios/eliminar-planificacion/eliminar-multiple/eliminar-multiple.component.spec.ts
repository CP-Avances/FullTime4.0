import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarMultipleComponent } from './eliminar-multiple.component';

describe('EliminarMultipleComponent', () => {
  let component: EliminarMultipleComponent;
  let fixture: ComponentFixture<EliminarMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EliminarMultipleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
