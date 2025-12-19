import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionGrid } from './auction-grid';

describe('AuctionGrid', () => {
  let component: AuctionGrid;
  let fixture: ComponentFixture<AuctionGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuctionGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuctionGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
