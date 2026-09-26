import { Component, input, model, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

/**
 * Optional image link input with a live thumbnail preview.
 * Usage: <app-image-link-field [(value)]="imageUrl" />
 */
@Component({
  selector: 'app-image-link-field',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './image-link-field.component.html',
  styleUrl: './image-link-field.component.scss',
})
export class ImageLinkFieldComponent {
  value = model('');
  label = input('Image Link (Optional)');

  previewFailed = signal(false);

  onInput(value: string) {
    this.value.set(value);
    this.previewFailed.set(false); // try loading the preview again for the new link
  }
}
