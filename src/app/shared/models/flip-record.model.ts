import { FlipRecordAddOn } from './flip-record-add-on.model';

// Matches FlipLeo.Core.DTOs.FlipRecord
export interface FlipRecord {
  id?: number;
  itemName: string;
  buyPrice: number;
  sellPrice: number;
  flipDate: string; // yyyy-MM-dd
  auctionId?: number | null;
  partsPrice?: number; // read-only: calculated by the API from the add-ons
  profit?: number;     // read-only: sellPrice - buyPrice - partsPrice
  addOns: FlipRecordAddOn[];
}
