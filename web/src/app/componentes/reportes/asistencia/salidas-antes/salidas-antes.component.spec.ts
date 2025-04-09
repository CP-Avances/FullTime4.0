import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalidasAntesComponent } from './salidas-antes.component';

describe('SalidasAntesComponent', () => {
  let component: SalidasAntesComponent;
  let fixture: ComponentFixture<SalidasAntesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SalidasAntesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalidasAntesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
