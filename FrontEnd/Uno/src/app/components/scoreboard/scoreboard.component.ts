import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { HttpParams } from '@angular/common/http';
import { IScoreboard } from '../../Interfaces/IScoreboard.types';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ILeaderBoard } from '../../Interfaces/ILeaderBoard.types';
import { ScoreboardService } from '../../services/scoreboard.service';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.css',
})
export class ScoreboardComponent implements OnInit {
  scoreBoard!: IScoreboard;
  leaderBoard!: ILeaderBoard;
  typeOfScoreboard: number = 0;
  scoreboardKey!: any[];

  constructor(
    private router: Router,
    private scoreboardService: ScoreboardService
  ) {}

  ngOnInit(): void {
    console.log(this.scoreboardService.typeOfScoreboard);
    this.typeOfScoreboard = this.scoreboardService.typeOfScoreboard;
    if (this.scoreboardService.typeOfScoreboard == 0) this.TakeLastScoreboard();
    if (this.scoreboardService.typeOfScoreboard == 1) this.WatchLeaderBoard();
  }

  TakeLastScoreboard() {
    let params: HttpParams = new HttpParams()
      .set('playerId', parseInt(localStorage.getItem('id')!))
      .set('token', localStorage.getItem('token')!);

    const takeLastScoreboardSubscription: Subscription = this.scoreboardService
      .TakeLastScoreboard(params)
      .subscribe({
        next: (lastScoreboard) => {
          (this.scoreBoard = lastScoreboard),
            (this.scoreboardKey = this.ObjectKeys(this.scoreBoard));
        },
        error: (err) => console.log(err.error),
        complete: () => takeLastScoreboardSubscription,
      });
  }

  WatchLeaderBoard() {
    const params: HttpParams = new HttpParams()
      .set('playerId', localStorage.getItem('id')!)
      .set('token', localStorage.getItem('token')!);

    const watchLeaderBoardSubscription: Subscription = this.scoreboardService
      .WatchLeaderBoard(params)
      .subscribe({
        next: (leaderBoard) => {
          this.leaderBoard = leaderBoard;
          this.scoreboardKey = this.ObjectKeys(leaderBoard);
          console.log(this.leaderBoard);
        },
        error: (err) => console.log(err.error),
        complete: () => watchLeaderBoardSubscription.unsubscribe(),
      });
  }

  ObjectKeys(scoreboard: IScoreboard | ILeaderBoard): any[] {
    return Object.keys(scoreboard);
  }

  BackHome() {
    this.router.navigate(['']);
  }
}
