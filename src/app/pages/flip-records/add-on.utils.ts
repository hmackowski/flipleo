import { AddOnPreset, FlipRecordAddOn } from '@app/shared/models';

/** A saved add-on (preset) becomes a flip add-on by copying its values, so later preset edits don't change past flips. */
export function fromPreset(preset: AddOnPreset): FlipRecordAddOn {
  return {
    addOnPresetId: preset.id ?? null,
    name: preset.name,
    price: preset.defaultPrice,
    link: preset.link ?? null,
    imageUrl: preset.imageUrl ?? null,
  };
}
