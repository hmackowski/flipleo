// Matches FlipLeo.Core.DTOs.Auction
export interface Auction {
  id: number;
  name: string;
  auctionSiteId: number;
  auctionSiteName?: string; // read-only, filled in by the API
  link: string;
  imageUrl?: string | null;
  currentPrice: number;
  startTime: Date;
  endTime: Date;
  notes?: string | null;
}
