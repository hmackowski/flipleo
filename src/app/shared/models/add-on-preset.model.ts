// Matches FlipLeo.Core.DTOs.AddOnPreset: a user's reusable add-on ("quick button")
export interface AddOnPreset {
  id?: number;
  name: string;
  defaultPrice: number;
  link?: string | null;     // where to buy it
  imageUrl?: string | null; // picture of the part
}
