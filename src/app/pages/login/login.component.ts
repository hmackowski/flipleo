import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class Login {
  username = signal('');
  password = signal('');
  errorMessage = signal('');
  hidePassword = signal(true);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  login() {
    this.errorMessage.set('');

    if (this.authService.login(this.username(), this.password())) {
      // Successful login - redirect to home page
      this.router.navigate(['/app']);
    } else {
      // Failed login
      this.errorMessage.set('Invalid username or password');
    }
  }

  togglePasswordVisibility() {
    this.hidePassword.set(!this.hidePassword());
  }
}
