// Matches FlipLeo.Core.DTOs.FlipStatus (LookupFlipStatus table)
export interface FlipStatus {
  id: number;
  name: string;
}

/** Ids of the LookupFlipStatus rows (same as FlipLeo.Core.Constants.FlipStatusIds). */
export const FlipStatusIds = {
  Bought: 1,
  Listed: 2,
  Sold: 3,
} as const;
