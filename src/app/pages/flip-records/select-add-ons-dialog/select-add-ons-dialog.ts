import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

import { AddOnPresetDataService } from '@app/core/services/data';
import { AddOnPreset } from '@app/shared/models';
import { ManageAddOnPresetsDialog } from '../manage-add-on-presets-dialog/manage-add-on-presets-dialog';

/**
 * Pick from the user's saved add-ons. Check the ones you want, then "Add" closes the dialog and
 * returns the selected presets (the caller copies them onto the flip).
 */
@Component({
  selector: 'app-select-add-ons-dialog',
  imports: [
    CurrencyPipe,
    FormsModule,
    MatButton,
    MatCheckbox,
    MatFormField,
    MatInput,
    MatLabel,
    MatPrefix,
    MatIcon,
  ],
  templateUrl: './select-add-ons-dialog.html',
  styleUrl: './select-add-ons-dialog.scss',
})
export class SelectAddOnsDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<SelectAddOnsDialog, AddOnPreset[]>);
  private dialog = inject(MatDialog);
  private addOnPresetDataService = inject(AddOnPresetDataService);

  presets = signal<AddOnPreset[]>([]);
  loaded = signal(false);
  search = signal('');
  selectedIds = signal<Set<number>>(new Set());

  filteredPresets = computed(() => {
    const term = this.search().trim().toLowerCase();
    return term
      ? this.presets().filter((p) => p.name.toLowerCase().includes(term))
      : this.presets();
  });

  selectedPresets = computed(() =>
    this.presets().filter((p) => p.id != null && this.selectedIds().has(p.id))
  );

  selectedTotal = computed(() =>
    this.selectedPresets().reduce((sum, p) => sum + p.defaultPrice, 0)
  );

  ngOnInit() {
    this.loadPresets();
  }

  loadPresets() {
    this.addOnPresetDataService.getAddOnPresets().subscribe((presets) => {
      this.presets.set(presets);
      this.loaded.set(true);
      // Drop selections for presets that were deleted in the manage dialog
      const ids = new Set(presets.map((p) => p.id));
      this.selectedIds.update((selected) => new Set([...selected].filter((id) => ids.has(id))));
    });
  }

  isSelected(preset: AddOnPreset): boolean {
    return preset.id != null && this.selectedIds().has(preset.id);
  }

  toggle(preset: AddOnPreset) {
    if (preset.id == null) return;
    const id = preset.id;
    this.selectedIds.update((selected) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** Create / edit / delete presets without leaving this dialog. */
  openManagePresets() {
    this.dialog
      .open<ManageAddOnPresetsDialog, void, boolean>(ManageAddOnPresetsDialog, { width: '900px', maxWidth: '95vw', autoFocus: false })
      .afterClosed()
      .subscribe((changed) => {
        if (changed) this.loadPresets();
      });
  }

  cancel() {
    this.dialogRef.close();
  }

  add() {
    if (this.selectedPresets().length === 0) return;
    this.dialogRef.close(this.selectedPresets());
  }
}
