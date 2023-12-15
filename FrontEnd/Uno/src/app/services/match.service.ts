import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Card } from '../Interfaces/Card.types';
import { StartGame } from '../Interfaces/StartGame.types';
import { Params } from '@angular/router';
import { DiscardObj } from '../Interfaces/DiscardObj.types';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  startGameStatus!: boolean;
  botNumber!: number;

  constructor(private api: ApiService) {}

  StartGame(body: StartGame) {
    let myHandSubject: Subject<Array<Card>> = new Subject<Array<Card>>();

    const startGameSubscription: Subscription = this.api
      .Post<Array<Card>>(
        `${environment.apiGameEndpoint}/api/GameManager/startGame`,
        body
      )
      .subscribe({
        next: (myHand) => myHandSubject.next(myHand),
        error: (err) => console.log(err.error),
        complete: () => startGameSubscription.unsubscribe(),
      });

    return myHandSubject;
  }

  Resume(params: HttpParams) {
    let myHandSubject: Subject<Array<Card>> = new Subject<Array<Card>>();

    const startGameSubscription: Subscription = this.api
      .Get<Array<Card>>(
        `${environment.apiGameEndpoint}/api/GameManager/resume`,
        { params }
      )
      .subscribe({
        next: (myCards) => myHandSubject.next(myCards),
        error: (err) => console.log(err.error),
        complete: () => startGameSubscription.unsubscribe(),
      });

    return myHandSubject;
  }

  TakeOpponentHandLength(params: HttpParams) {
    let opponentHandLengthSubject: Subject<Array<number>> = new Subject<
      Array<number>
    >();

    const opponentHandLengthSubscription: Subscription = this.api
      .Get<Array<number>>(
        `${environment.apiGameEndpoint}/api/GameManager/takeOpponentHandLength`,
        { params }
      )
      .subscribe({
        next: (opponentHandslLength) =>
          opponentHandLengthSubject.next(opponentHandslLength),
        error: (err) => console.log(err.error),
        complete: () => opponentHandLengthSubscription.unsubscribe(),
      });
    return opponentHandLengthSubject;
  }

  TakeLastCard(params: HttpParams) {
    let TakeLastCardSubject: Subject<Card> = new Subject<Card>();

    const takeLastCardSubscription: Subscription = this.api
      .Get<Card>(
        `${environment.apiGameEndpoint}/api/GameManager/takeLastCard`,
        {
          params,
        }
      )
      .subscribe({
        next: (lastCard) => TakeLastCardSubject.next(lastCard),
        error: (err) => console.log(err.error),
        complete: () => takeLastCardSubscription.unsubscribe(),
      });

    return TakeLastCardSubject;
  }

  DrawCard(params: Params) {
    let newCardSubject: Subject<Card> = new Subject<Card>();

    const drawCardSubscription: Subscription = this.api
      .Get<Card>(`${environment.apiGameEndpoint}/api/GameManager/drawCard`, {
        params,
      })
      .subscribe({
        next: (newCard) => newCardSubject.next(newCard),
        error: (err) => console.log(err.error),
        complete: () => drawCardSubscription.unsubscribe(),
      });

    return newCardSubject;
  }

  DiscardCard(body: DiscardObj) {
    let discardResponse: Subject<boolean> = new Subject<boolean>();

    const discardCardSubscription: Subscription = this.api
      .Post(`${environment.apiGameEndpoint}/api/GameManager/discardCard`, body)
      .subscribe({
        next: (res) => discardResponse.next(true),
        error: (err) => console.log(err.error),
        complete: () => discardCardSubscription.unsubscribe(),
      });

    return discardResponse;
  }
}
