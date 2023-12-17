import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private api: ApiService) {}

  TakeAllMyScoreboards() {}

  WatchLeaderBoard(params: HttpParams) {
    const watchLeaderBoardSubscription: Subscription = this.api
      .Get(`${environment.apiGameEndpoint}/api/GameManager/watchLeaderBoard`, {
        params,
      })
      .subscribe({
        next: (leaderBoard) => console.log(leaderBoard),
        error: (err) => console.log(err.error),
        complete: () => watchLeaderBoardSubscription.unsubscribe(),
      });
  }
}
