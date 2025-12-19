export interface Auction {
  id: number;
  name: string;
  startTime: Date;
  currentPrice: number;
  link: string;
  endTime: Date;
  notes?: string;
}
