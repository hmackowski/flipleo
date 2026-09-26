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

import { getErrorMessage } from '@app/core/interceptors/http-error.interceptor';
import { AuthService } from '@app/core/services/auth.service';
import { UserProfile } from '@app/shared/models';
import { Observable } from 'rxjs';

/** One page for both signing in and creating an account (toggle between the two modes). */
@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class Login implements OnInit {
  isRegisterMode = signal(false);

  email = signal('');
  displayName = signal('');
  password = signal('');
  confirmPassword = signal('');

  errorMessage = signal('');
  hidePassword = signal(true);
  isSubmitting = signal(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // /login?mode=register opens straight into "Create account"
    this.isRegisterMode.set(this.route.snapshot.queryParamMap.get('mode') === 'register');
  }

  toggleMode() {
    this.isRegisterMode.update((isRegister) => !isRegister);
    this.errorMessage.set('');
    this.password.set('');
    this.confirmPassword.set('');
  }

  isFormValid(): boolean {
    const hasLogin = this.email().trim() !== '' && this.password() !== '';
    if (!this.isRegisterMode()) return hasLogin;

    return hasLogin &&
      this.displayName().trim() !== '' &&
      this.password().length >= 8 &&
      this.password() === this.confirmPassword();
  }

  submit() {
    this.errorMessage.set('');

    if (this.isRegisterMode() && this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }
    if (!this.isFormValid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const request$: Observable<UserProfile> = this.isRegisterMode()
      ? this.authService.register({
          email: this.email().trim(),
          displayName: this.displayName().trim(),
          password: this.password()
        })
      : this.authService.login({ email: this.email().trim(), password: this.password() });

    request$.subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/flips';
        this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(getErrorMessage(error));
        this.isSubmitting.set(false);
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }
}
