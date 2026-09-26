import { Routes } from '@angular/router';
import { Home } from './pages/home/home.component';
import { Login } from './pages/login/login.component';
import { FlipRecords } from './pages/flip-records/flip-records.component';
import { authGuard } from '@app/core/guards/auth.guard';
import {AuctionsComponent} from './pages/auctions/auctions.component';
import { ForgotPassword } from './pages/forgot-password/forgot-password.component';
import { ResetPassword } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword }, // opened from the emailed link
  { path: 'flips', component: FlipRecords, canActivate: [authGuard] },
  { path: 'auctions', component: AuctionsComponent, canActivate: [authGuard] }
];
