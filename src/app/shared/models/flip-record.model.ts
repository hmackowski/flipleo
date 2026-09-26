import { FlipRecordAddOn } from './flip-record-add-on.model';

// Matches FlipLeo.Core.DTOs.FlipRecord
export interface FlipRecord {
  id?: number;
  itemName: string;
  imageUrl?: string | null; // optional link to a photo of the item
  buyPrice: number;
  sellPrice?: number | null; // required once Sold; while Listed it can be the asking price
  flipDate: string; // yyyy-MM-dd: the date it was bought
  flipStatusId: number; // see FlipStatusIds
  flipStatusName?: string; // read-only, filled in by the API
  soldDate?: string | null; // yyyy-MM-dd, only when Sold
  auctionId?: number | null;
  partsPrice?: number; // read-only: calculated by the API from the add-ons
  profit?: number | null; // read-only: sellPrice - buyPrice - partsPrice, null until Sold
  addOns: FlipRecordAddOn[];
}
