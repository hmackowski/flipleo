import { Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { getErrorMessage } from '@app/core/interceptors/http-error.interceptor';
import { AuthDataService } from '@app/core/services/data';

/** "Forgot password?": asks for the email and sends a reset link. */
@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../login/login.component.scss',
})
export class ForgotPassword {
  email = signal('');
  isSubmitting = signal(false);
  isSent = signal(false);
  errorMessage = signal('');

  constructor(private authDataService: AuthDataService) {}

  submit() {
    const email = this.email().trim();
    if (!email || this.isSubmitting()) return;

    this.errorMessage.set('');
    this.isSubmitting.set(true);

    this.authDataService.forgotPassword(email).subscribe({
      next: () => {
        this.isSent.set(true);
        this.isSubmitting.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.isSubmitting.set(false);
      },
    });
  }
}
