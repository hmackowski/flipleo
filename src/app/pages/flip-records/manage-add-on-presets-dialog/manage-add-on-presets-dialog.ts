import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

import { AddOnPresetDataService } from '@app/core/services/data';
import { ConfirmDialogService } from '@app/core/services/confirm-dialog.service';
import { AddOnPreset } from '@app/shared/models';

/**
 * Create, edit and delete the current user's add-on presets (the quick buttons on the Flips page).
 * Closes with `true` if anything changed so the page can reload its presets.
 */
@Component({
  selector: 'app-manage-add-on-presets-dialog',
  imports: [
    CurrencyPipe,
    FormsModule,
    MatButton,
    MatIconButton,
    MatFormField,
    MatInput,
    MatLabel,
    MatPrefix,
    MatIcon,
  ],
  templateUrl: './manage-add-on-presets-dialog.html',
  styleUrl: './manage-add-on-presets-dialog.scss',
})
export class ManageAddOnPresetsDialog implements OnInit {
  private dialogRef = inject(MatDialogRef<ManageAddOnPresetsDialog, boolean>);
  private addOnPresetDataService = inject(AddOnPresetDataService);
  private confirmDialog = inject(ConfirmDialogService);

  presets = signal<AddOnPreset[]>([]);
  private changed = false;

  // The preset being edited (a copy, so Cancel discards changes)
  editingId = signal<number | null>(null);
  editName = signal('');
  editPrice = signal<number | null>(null);
  editLink = signal('');
  editImageUrl = signal('');

  // New preset form
  newName = signal('');
  newPrice = signal<number | null>(null);
  newLink = signal('');
  newImageUrl = signal('');

  ngOnInit() {
    this.loadPresets();
  }

  loadPresets() {
    this.addOnPresetDataService
      .getAddOnPresets()
      .subscribe((presets) => this.presets.set(presets));
  }

  isNewValid(): boolean {
    return this.newName().trim() !== '' && this.newPrice() !== null && (this.newPrice() ?? 0) >= 0;
  }

  addPreset() {
    if (!this.isNewValid()) return;

    this.addOnPresetDataService
      .addAddOnPreset({
        name: this.newName().trim(),
        defaultPrice: this.newPrice() ?? 0,
        link: this.newLink().trim() || null,
        imageUrl: this.newImageUrl().trim() || null,
      })
      .subscribe(() => {
        this.changed = true;
        this.newName.set('');
        this.newPrice.set(null);
        this.newLink.set('');
        this.newImageUrl.set('');
        this.loadPresets();
      });
  }

  startEdit(preset: AddOnPreset) {
    this.editingId.set(preset.id ?? null);
    this.editName.set(preset.name);
    this.editPrice.set(preset.defaultPrice);
    this.editLink.set(preset.link || '');
    this.editImageUrl.set(preset.imageUrl || '');
  }

  cancelEdit() {
    this.editingId.set(null);
  }

  isEditValid(): boolean {
    return this.editName().trim() !== '' && this.editPrice() !== null && (this.editPrice() ?? 0) >= 0;
  }

  saveEdit() {
    const id = this.editingId();
    if (id === null || !this.isEditValid()) return;

    this.addOnPresetDataService
      .updateAddOnPreset({
        id,
        name: this.editName().trim(),
        defaultPrice: this.editPrice() ?? 0,
        link: this.editLink().trim() || null,
        imageUrl: this.editImageUrl().trim() || null,
      })
      .subscribe(() => {
        this.changed = true;
        this.editingId.set(null);
        this.loadPresets();
      });
  }

  deletePreset(preset: AddOnPreset) {
    const presetId = preset.id;
    if (presetId == null) return;

    this.confirmDialog
      .confirm({
        title: 'Delete add-on?',
        message: `"${preset.name}" will be removed from My Add-Ons. Flips that already use it keep their copy.`,
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.addOnPresetDataService.deleteAddOnPreset(presetId).subscribe(() => {
          this.changed = true;
          this.loadPresets();
        });
      });
  }

  close() {
    this.dialogRef.close(this.changed);
  }
}
