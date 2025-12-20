import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAddOnDialog } from './create-add-on-dialog';

describe('CreateAddOnDialog', () => {
  let component: CreateAddOnDialog;
  let fixture: ComponentFixture<CreateAddOnDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAddOnDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAddOnDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
