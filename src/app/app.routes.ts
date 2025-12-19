import { Routes } from '@angular/router';
import { Home } from './pages/home/home.component';
import { Login } from './pages/login/login.component';
import { FlipRecords } from './pages/flip-records/flip-records.component';
import { authGuard } from './guards/auth.guard';
import {AuctionsComponent} from './pages/auctions/auctions.component';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'flips', component: FlipRecords, canActivate: [authGuard] },
  { path: 'auctions', component: AuctionsComponent, canActivate: [authGuard] }
];
