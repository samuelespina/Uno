import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { HttpParams } from '@angular/common/http';
import { IScoreboard } from '../../Interfaces/IScoreboard.types';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.css',
})
export class ScoreboardComponent implements OnInit {
  scoreBoard!: IScoreboard;

  constructor(private matchService: MatchService, private router: Router) {}

  ngOnInit(): void {
    this.TakeLastScoreboard();
  }

  TakeLastScoreboard() {
    let params: HttpParams = new HttpParams()
      .set('playerId', parseInt(localStorage.getItem('id')!))
      .set('token', localStorage.getItem('token')!);

    const takeLastScoreboardSubscription: Subscription = this.matchService
      .TakeLastScoreboard(params)
      .subscribe({
        next: (lastScoreboard) => (
          (this.scoreBoard = lastScoreboard), console.log(this.scoreBoard)
        ),
        error: (err) => console.log(err.error),
        complete: () => takeLastScoreboardSubscription,
      });
  }

  ObjectKeys(): any[] {
    return Object.keys(this.scoreBoard);
  }

  BackHome() {
    this.router.navigate(['']);
  }
}
