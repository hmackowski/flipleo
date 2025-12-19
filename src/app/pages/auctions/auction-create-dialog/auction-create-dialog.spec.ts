import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionCreateDialog } from './auction-create-dialog';

describe('AuctionCreateDialog', () => {
  let component: AuctionCreateDialog;
  let fixture: ComponentFixture<AuctionCreateDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionCreateDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionCreateDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
