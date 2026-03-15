import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationsCatalogue } from './formations-catalogue';

describe('FormationsCatalogue', () => {
  let component: FormationsCatalogue;
  let fixture: ComponentFixture<FormationsCatalogue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationsCatalogue]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationsCatalogue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
