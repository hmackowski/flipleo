export interface Auction {
  id: number;
  name: string;
  startTime: Date;
  currentPrice: number;
  auctionSite: string;
  link: string;
  endTime: Date;
  notes?: string;
  imgURL?: string;
}
