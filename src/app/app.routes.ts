import { Routes } from '@angular/router';
import { Home } from './pages/home/home.component';
import { Login } from './pages/login/login.component';
import { FlipRecords } from './pages/flip-records/flip-records.component';
import { authGuard } from '@app/core/guards/auth.guard';
import { guestGuard } from '@app/core/guards/guest.guard';
import {AuctionsComponent} from './pages/auctions/auctions.component';
import { ForgotPassword } from './pages/forgot-password/forgot-password.component';
import { ResetPassword } from './pages/reset-password/reset-password.component';

export const routes: Routes = [
  // Signed-out pages: signed-in users are sent to /flips instead
  { path: '', component: Home, canActivate: [guestGuard] },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [guestGuard] },
  // Not guarded: the emailed link must work even if this browser is still signed in
  { path: 'reset-password', component: ResetPassword },
  { path: 'flips', component: FlipRecords, canActivate: [authGuard] },
  { path: 'auctions', component: AuctionsComponent, canActivate: [authGuard] }
];
