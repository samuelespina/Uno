import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Subject, Subscription } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Card } from '../Interfaces/Card.types';
import { StartGame } from '../Interfaces/StartGame.types';
import { Params, Router } from '@angular/router';
import { DiscardObj } from '../Interfaces/DiscardObj.types';
import { OpponentMove } from '../Interfaces/OpponentMove.types';
import { ChangeColorObj } from '../Interfaces/ChangeColorObj.types';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  startGameStatus!: boolean;
  botNumber!: number;
  errorMessage: string = '';
  newCard!: Card;
  playerNewCards!: Array<Card>;

  constructor(private api: ApiService, private router: Router) {}

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
    let callStatusSubject: Subject<boolean> = new Subject<boolean>();

    const drawCardSubscription: Subscription = this.api
      .Get<Card>(`${environment.apiGameEndpoint}/api/GameManager/drawCard`, {
        params,
      })
      .subscribe({
        next: (newCard) => {
          this.newCard = newCard;
          callStatusSubject.next(true);
        },
        error: (err) => {
          this.errorMessage = err.error;
          callStatusSubject.next(false);
        },
        complete: () => drawCardSubscription.unsubscribe(),
      });

    return callStatusSubject;
  }

  DiscardCard(body: DiscardObj) {
    let callStatusSubject: Subject<boolean> = new Subject<boolean>();

    const discardCardSubscription: Subscription = this.api
      .Post(`${environment.apiGameEndpoint}/api/GameManager/discardCard`, body)
      .subscribe({
        next: (res) => callStatusSubject.next(true),
        error: (err) => {
          this.errorMessage = err.error;
          callStatusSubject.next(false);
        },
        complete: () => discardCardSubscription.unsubscribe(),
      });

    return callStatusSubject;
  }

  Next(params: HttpParams) {
    let callStatusSubject: Subject<boolean> = new Subject<boolean>();

    const nextSubscription: Subscription = this.api
      .Get<Array<Card>>(`${environment.apiGameEndpoint}/api/GameManager/next`, {
        params,
      })
      .subscribe({
        next: (playerNewCards) => {
          this.playerNewCards = playerNewCards;
          callStatusSubject.next(true);
        },
        error: (err) => {
          this.errorMessage = err.error;
          callStatusSubject.next(false);
        },
        complete: () => nextSubscription.unsubscribe(),
      });

    return callStatusSubject;
  }

  OpponentAIMoves(params: HttpParams) {
    let opponentHandLengthSubject: Subject<Array<OpponentMove>> = new Subject<
      Array<OpponentMove>
    >();

    const opponentHandLengthSubscription: Subscription = this.api
      .Get<Array<OpponentMove>>(
        `${environment.apiGameEndpoint}/api/GameManager/getOpponentAIGameMoves`,
        { params }
      )
      .subscribe({
        next: (opponentMoves) => opponentHandLengthSubject.next(opponentMoves),
        error: (err) => console.log(err.error),
        complete: () => opponentHandLengthSubscription.unsubscribe(),
      });

    return opponentHandLengthSubject;
  }

  ChangeColor(body: ChangeColorObj) {
    let newColorSubject: Subject<string> = new Subject<string>();

    const changeColorSubscription: Subscription = this.api
      .Post<string>(
        `${environment.apiGameEndpoint}/api/GameManager/changeColor`,
        body
      )
      .subscribe({
        next: (newColor) => newColorSubject.next(newColor.toLowerCase()),
        error: (err) => console.log(err.error),
        complete: () => changeColorSubscription.unsubscribe(),
      });

    return newColorSubject;
  }

  TakeLastScoreboard(params: HttpParams) {
    let lastScoreboardSubject: Subject<any> = new Subject<any>();

    const takeLastScoreboardSubscription: Subscription = this.api
      .Get(
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

  SaveMatch(params: HttpParams) {
    const saveMatchSubscription: Subscription = this.api
      .Get(`${environment.apiGameEndpoint}/api/GameManager/saveMatch`, {
        params,
      })
      .subscribe({
        next: () => this.router.navigate(['']),
        error: (err) => console.log(err.error),
        complete: () => saveMatchSubscription.unsubscribe(),
      });
  }
}
