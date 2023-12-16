import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.css',
})
export class ScoreboardComponent implements OnInit {
  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    this.TakeLastScoreboard();
  }

  TakeLastScoreboard() {
    let params: HttpParams = new HttpParams()
      .set('playerId', parseInt(localStorage.getItem('id')!))
      .set('token', localStorage.getItem('token')!);

    this.matchService.TakeLastScoreboard(params);
  }
}
