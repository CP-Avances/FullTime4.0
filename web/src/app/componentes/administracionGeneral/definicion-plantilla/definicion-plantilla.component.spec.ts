import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefinicionPlantillaComponent } from './definicion-plantilla.component';

describe('DefinicionPlantillaComponent', () => {
  let component: DefinicionPlantillaComponent;
  let fixture: ComponentFixture<DefinicionPlantillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DefinicionPlantillaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefinicionPlantillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
