import { Routes } from '@angular/router';
import { Home } from './pages/home/home.component';
import { Login } from './pages/login/login.component';
import { FlipRecords } from './pages/flip-records/flip-records.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'app', component: FlipRecords, canActivate: [authGuard] }
];
