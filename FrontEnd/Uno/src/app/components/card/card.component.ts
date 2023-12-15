import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css',
})
export class CardComponent {
  @Input() enemyOrNot: boolean = false;
  @Input() color!: number;
  @Input() value!: number;
  @Input() isHandCard: boolean = true;
}
