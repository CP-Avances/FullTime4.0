import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministraComidaComponent } from './administra-comida.component';

describe('AdministraComidaComponent', () => {
  let component: AdministraComidaComponent;
  let fixture: ComponentFixture<AdministraComidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministraComidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdministraComidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
