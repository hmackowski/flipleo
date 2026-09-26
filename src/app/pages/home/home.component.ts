import {Component, signal} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {GreetingDataService} from '@app/core/services/data';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home {
  apiMessage = signal('');
  constructor(private router: Router,
              private greetingDataService: GreetingDataService) {
    this.greetingDataService.getGreeting().subscribe({
      next: (result) => this.apiMessage.set(result.message),
      error: () => this.apiMessage.set('API not reachable'),
    });
  }

  exampleDeals = [
    {
      title: 'PlayStation 5',
      buyPrice: 100,
      sellPrice: 300,
      profit: 200,
      profitPercent: 200,
      image: '🎮'
    },
    {
      title: 'iPhone 14 Pro',
      buyPrice: 400,
      sellPrice: 750,
      profit: 350,
      profitPercent: 87.5,
      image: '📱'
    },
    {
      title: 'Designer Sneakers',
      buyPrice: 80,
      sellPrice: 220,
      profit: 140,
      profitPercent: 175,
      image: '👟'
    }
  ];

  startFlipping() {
    this.router.navigate(['/flips']);
  }
}
