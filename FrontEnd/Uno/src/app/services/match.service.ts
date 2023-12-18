import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment';
import { Subject, Subscription } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ICard } from '../Interfaces/ICard.types';
import { IStartGame } from '../Interfaces/IStartGame.types';
import { Params, Router } from '@angular/router';
import { IDiscardObj } from '../Interfaces/IDiscardObj.types';
import { IOpponentMove } from '../Interfaces/IOpponentMove.types';
import { IChangeColorObj } from '../Interfaces/IChangeColorObj.types';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  startGameStatus!: boolean;
  botNumber!: number;
  errorMessage: string = '';
  newCard!: ICard;
  playerNewCards!: Array<ICard>;

  constructor(private api: ApiService, private router: Router) {}

  StartGame(body: IStartGame) {
    let myHandSubject: Subject<Array<ICard>> = new Subject<Array<ICard>>();

    const startGameSubscription: Subscription = this.api
      .Post<Array<ICard>>(
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
    let myHandSubject: Subject<Array<ICard>> = new Subject<Array<ICard>>();

    const startGameSubscription: Subscription = this.api
      .Get<Array<ICard>>(
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
    let TakeLastCardSubject: Subject<ICard> = new Subject<ICard>();

    const takeLastCardSubscription: Subscription = this.api
      .Get<ICard>(
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
      .Get<ICard>(`${environment.apiGameEndpoint}/api/GameManager/drawCard`, {
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

  DiscardCard(body: IDiscardObj) {
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
      .Get<Array<ICard>>(
        `${environment.apiGameEndpoint}/api/GameManager/next`,
        {
          params,
        }
      )
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
    let opponentHandLengthSubject: Subject<Array<IOpponentMove>> = new Subject<
      Array<IOpponentMove>
    >();

    const opponentHandLengthSubscription: Subscription = this.api
      .Get<Array<IOpponentMove>>(
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

  ChangeColor(body: IChangeColorObj) {
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
