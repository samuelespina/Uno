import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { ILeaderBoard } from '../Interfaces/ILeaderBoard.types';
import { IScoreboard } from '../Interfaces/IScoreboard.types';

@Injectable({
  providedIn: 'root',
})
export class ScoreboardService {
  typeOfScoreboard: number = 0;

  constructor(private api: ApiService) {}

  ChangeTypeOfScoreboard(type: number) {
    this.typeOfScoreboard = type;
  }

  TakeLastScoreboard(params: HttpParams) {
    let lastScoreboardSubject: Subject<IScoreboard> =
      new Subject<IScoreboard>();

    const takeLastScoreboardSubscription: Subscription = this.api
      .Get<IScoreboard>(
        `${environment.apiGameEndpoint}/api/GameManager/takeMyLastScoreboard`,
        { params }
      )
      .subscribe({
        next: (lastScoreboard) => lastScoreboardSubject.next(lastScoreboard),
        error: (err) => console.log(err.error),
        complete: () => takeLastScoreboardSubscription.unsubscribe(),
      });

    return lastScoreboardSubject;
  }

  TakeAllMyScoreboards() {}

  WatchLeaderBoard(params: HttpParams) {
    let leaderBoardSubject: Subject<ILeaderBoard> = new Subject<ILeaderBoard>();

    const watchLeaderBoardSubscription: Subscription = this.api
      .Get<ILeaderBoard>(
        `${environment.apiGameEndpoint}/api/GameManager/watchLeaderBoard`,
        {
          params,
        }
      )
      .subscribe({
        next: (leaderBoard) => leaderBoardSubject.next(leaderBoard),
        error: (err) => console.log(err.error),
        complete: () => watchLeaderBoardSubscription.unsubscribe(),
      });

    return leaderBoardSubject;
  }
}
