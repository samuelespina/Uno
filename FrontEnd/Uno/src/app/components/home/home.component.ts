import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  startGameStatus: boolean = true;
  botNUmber: number = 1;

  constructor(private matchService: MatchService, private router: Router) {}

  ngOnInit(): void {
    const params: HttpParams = new HttpParams()
      .set('playerId', localStorage.getItem('id')!)
      .set('token', localStorage.getItem('token')!);
    const resumeSubscription: Subscription = this.matchService
      .Resume(params)
      .subscribe({
        next: (res) => (this.startGameStatus = !this.startGameStatus),
        error: (err) => console.log(err),
        complete: () => resumeSubscription.unsubscribe(),
      });
  }

  AddOrSubtractBot(operation: string) {
    if (this.botNUmber < 5 && operation === '+') {
      this.botNUmber++;
    } else if (this.botNUmber > 1 && operation === '-') {
      this.botNUmber--;
    }
  }

  TakeYourMatch() {
    this.matchService.botNumber = this.botNUmber;
    this.matchService.startGameStatus = this.startGameStatus;
    this.router.navigate(['match']);
  }
}
