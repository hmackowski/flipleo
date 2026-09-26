import { Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { getErrorMessage } from '@app/core/interceptors/http-error.interceptor';
import { AuthDataService } from '@app/core/services/data';

/** Opened from the emailed link (/reset-password?token=...): sets a new password. */
@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrl: '../login/login.component.scss',
})
export class ResetPassword implements OnInit {
  token = '';
  password = signal('');
  confirmPassword = signal('');
  hidePassword = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private authDataService: AuthDataService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
  }

  isFormValid(): boolean {
    return this.password().length >= 8 && this.password() === this.confirmPassword();
  }

  submit() {
    this.errorMessage.set('');

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.authDataService.resetPassword(this.token, this.password()).subscribe({
      next: (result) => {
        this.snackBar.open(result.detail ?? 'Password reset. You can sign in now.', 'Dismiss', { duration: 6000 });
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.isSubmitting.set(false);
      },
    });
  }
}
