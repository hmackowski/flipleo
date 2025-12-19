import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class Home {
  constructor(private router: Router) {}

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
