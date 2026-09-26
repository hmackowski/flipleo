// Matches FlipLeo.Core.DTOs.FlipRecordAddOn
export interface FlipRecordAddOn {
  id?: number;
  flipRecordId?: number;
  addOnPresetId?: number | null; // set when created from one of the user's presets
  name: string;
  price: number;
  link?: string | null;
  imageUrl?: string | null;
}
