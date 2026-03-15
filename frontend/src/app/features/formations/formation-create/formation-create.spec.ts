import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationCreate } from './formation-create';

describe('FormationCreate', () => {
  let component: FormationCreate;
  let fixture: ComponentFixture<FormationCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormationCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormationCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
