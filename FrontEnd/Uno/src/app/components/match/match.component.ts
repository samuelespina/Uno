import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { HttpParams } from '@angular/common/http';
import { Subscription, delay, timeout } from 'rxjs';
import { ICard } from '../../Interfaces/ICard.types';
import { IStartGame } from '../../Interfaces/IStartGame.types';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { IDiscardObj } from '../../Interfaces/IDiscardObj.types';
import { IOpponentMove } from '../../Interfaces/IOpponentMove.types';
import { IChangeColorObj } from '../../Interfaces/IChangeColorObj.types';
import { Router } from '@angular/router';
import { ScoreboardComponent } from '../scoreboard/scoreboard.component';
import { ScoreboardService } from '../../services/scoreboard.service';

@Component({
  selector: 'app-match',
  standalone: true,
  templateUrl: './match.component.html',
  styleUrl: './match.component.css',
  imports: [CommonModule, CardComponent, ScoreboardComponent],
})
export class MatchComponent implements OnInit {
  myHand!: Array<ICard>;
  myHandCardCoordinates: Array<Array<number>> = [];
  opponentHandsLength!: Array<number>;
  lastCard!: ICard;
  lastCardCoordinates: Array<Array<number>> = [];
  playingPlayerIndex: number = 0;
  changeColorDiscard: boolean = false;
  wildColor!: string;
  isMyTurn: boolean = true;
  errorMessage: string = '';
  errorMessageAnimation: boolean = false;
  unoPopup: boolean = false;
  doYouClicked: boolean = false;

  constructor(
    private matchService: MatchService,
    private router: Router,
    private scoreboardService: ScoreboardService
  ) {}

  ngOnInit(): void {
    const params: HttpParams = new HttpParams()
      .set('playerId', localStorage.getItem('id')!)
      .set('token', localStorage.getItem('token')!);

    if (this.matchService.startGameStatus) {
      const body: IStartGame = {
        botNumber: this.matchService.botNumber,
        playerId: parseInt(localStorage.getItem('id')!),
        name: localStorage.getItem('name')!,
        surname: localStorage.getItem('surname')!,
        token: localStorage.getItem('token')!,
      };

      const startGameSubscription: Subscription = this.matchService
        .StartGame(body)
        .subscribe({
          next: async (myHand) => {
            this.myHand = myHand;
            this.MyCardCalc();
            console.log('START MATCH ' + this.myHand);
            const opponentHandLengthSubscription: Subscription =
              this.matchService.TakeOpponentHandLength(params).subscribe({
                next: (opponentHandsLength) => {
                  this.opponentHandsLength = opponentHandsLength;
                  console.log(this.opponentHandsLength);
                  const TakeLastCardSubscription: Subscription =
                    this.matchService.TakeLastCard(params).subscribe({
                      next: (lastCard) => {
                        this.lastCard = lastCard;
                        this.LastCardCalc();
                        console.log('LAST CARD ' + this.lastCard);
                      },
                      error: (err) => console.log(err),
                      complete: () => TakeLastCardSubscription.unsubscribe(),
                    });
                },
                error: (err) => console.log(err),
                complete: () => opponentHandLengthSubscription.unsubscribe(),
              });
          },
          error: (err) => console.log(err.error),
          complete: () => startGameSubscription.unsubscribe(),
        });
    } else {
      const resumeSubscription: Subscription = this.matchService
        .Resume(params)
        .subscribe({
          next: (myHand) => {
            this.myHand = myHand;
            this.MyCardCalc();
            console.log(this.myHand);
            const opponentHandLengthSubscription: Subscription =
              this.matchService.TakeOpponentHandLength(params).subscribe({
                next: (opponentHandsLength) => {
                  this.opponentHandsLength = opponentHandsLength;
                  console.log(
                    'OPPONENT HAND LENGTH ' + this.opponentHandsLength
                  );
                  const TakeLastCardSubscription: Subscription =
                    this.matchService.TakeLastCard(params).subscribe({
                      next: (lastCard) => {
                        this.lastCard = lastCard;
                        this.LastCardCalc();
                        console.log(this.lastCard);
                      },
                      error: (err) => console.log(err),
                      complete: () => TakeLastCardSubscription.unsubscribe(),
                    });
                },
                error: (err) => console.log(err),
                complete: () => opponentHandLengthSubscription.unsubscribe(),
              });
          },
          error: (err) => console.log(err),
          complete: () => resumeSubscription.unsubscribe(),
        });
    }
    console.log('playerid ' + this.playingPlayerIndex);
  }

  Iterate(num: number): number[] {
    return new Array(num).fill(null);
  }

  SpaceCalc(x: number): number {
    const k = 5;
    return k / x;
  }

  MyCardCalc() {
    for (let i = 0; i < this.myHand.length; i++) {
      let cardCoordinates: Array<number> = [];
      if (this.myHand[i].Value >= 0 && this.myHand[i].Value <= 11) {
        let number = 140 * this.myHand[i].Value + 19;
        cardCoordinates.push(number);
        if (this.myHand[i].Color != 4) {
          let color = 210 * this.myHand[i].Color + 15;
          cardCoordinates.push(color);
        }
      }

      if (this.myHand[i].Value == 12) {
        let color = 140 * this.myHand[i].Color + 19;
        let number = 855;
        cardCoordinates.push(color);
        cardCoordinates.push(number);
      }

      if (this.myHand[i].Value == 13) {
        let color = 579;
        let number = 855;
        cardCoordinates.push(color);
        cardCoordinates.push(number);
      }

      if (this.myHand[i].Value == 14) {
        let color = 859;
        let number = 855;
        cardCoordinates.push(color);
        cardCoordinates.push(number);
      }

      this.myHandCardCoordinates.push(cardCoordinates);
    }
  }

  LastCardCalc() {
    let cardCoordinates: Array<number> = [];
    if (this.lastCard.Value >= 0 && this.lastCard.Value <= 11) {
      let number = 140 * this.lastCard.Value + 19;
      cardCoordinates.push(number);
      if (this.lastCard.Color != 4) {
        let color = 210 * this.lastCard.Color + 15;
        cardCoordinates.push(color);
      }
    }

    if (this.lastCard.Value == 12) {
      let color = 140 * this.lastCard.Color + 19;
      let number = 855;
      cardCoordinates.push(color);
      cardCoordinates.push(number);
    }

    if (this.lastCard.Value == 13) {
      let color = 579;
      let number = 855;
      cardCoordinates.push(color);
      cardCoordinates.push(number);
    }

    if (this.lastCard.Value == 14) {
      let color = 859;
      let number = 855;
      cardCoordinates.push(color);
      cardCoordinates.push(number);
    }

    this.lastCardCoordinates.push(cardCoordinates);
  }

  DrawCard(typeOfDraw: boolean = false) {
    if (this.playingPlayerIndex == 0) {
      const params: HttpParams = new HttpParams()
        .set('playerId', localStorage.getItem('id')!)
        .set('token', localStorage.getItem('token')!)
        .set('typeOfDraw', typeOfDraw);

      const drawCardSubscription: Subscription = this.matchService
        .DrawCard(params)
        .subscribe({
          next: (callResult) => {
            if (callResult) {
              this.errorMessageAnimation = false;
              this.errorMessage = '';
              this.myHand.push(this.matchService.newCard);
              this.myHandCardCoordinates = [];
              this.MyCardCalc();
            } else {
              this.errorMessage = this.matchService.errorMessage;
              this.errorMessageAnimation = true;
              setTimeout(() => {
                this.errorMessageAnimation = false;
              }, 3000);
            }
          },
          error: (err) => console.log(err.error),
          complete: () => drawCardSubscription.unsubscribe(),
        });
    }
  }

  DiscardCard(cardIndex: number) {
    if (this.playingPlayerIndex == 0) {
      const body: IDiscardObj = {
        playerId: parseInt(localStorage.getItem('id')!),
        cardIndex: cardIndex,
        token: localStorage.getItem('token')!,
      };

      const params: HttpParams = new HttpParams()
        .set('playerId', localStorage.getItem('id')!)
        .set('token', localStorage.getItem('token')!);

      const discardCardSubscription: Subscription = this.matchService
        .DiscardCard(body)
        .subscribe({
          next: async (callResult) => {
            if (callResult) {
              this.errorMessageAnimation = false;
              this.errorMessage = '';
              this.myHand.splice(cardIndex, 1);
              this.myHandCardCoordinates.splice(cardIndex, 1);
              if (this.myHand.length == 0) {
                setTimeout(() => {
                  this.scoreboardService.ChangeTypeOfScoreboard(0);
                  this.router.navigate(['scoreboard']);
                }, 500);
              }
              const TakeLastCardSubscription: Subscription = this.matchService
                .TakeLastCard(params)
                .subscribe({
                  next: (lastCard) => {
                    this.lastCard = lastCard;
                    this.lastCardCoordinates = [];
                    this.LastCardCalc();
                    if (lastCard.Color == 4) {
                      this.changeColorDiscard = true;
                    }
                    if (this.myHand.length == 1) {
                      this.unoPopup = true;
                      setTimeout(() => {
                        this.unoPopup = false;
                        if (!this.doYouClicked) {
                          console.log('ciao');
                          this.DrawCard(true);
                        } else {
                          this.doYouClicked = false;
                        }
                      }, 3000);
                    }
                  },
                  error: (err) => console.log(err),
                  complete: () => TakeLastCardSubscription.unsubscribe(),
                });
            } else {
              this.errorMessage = this.matchService.errorMessage;
              this.errorMessageAnimation = true;
              setTimeout(() => {
                this.errorMessageAnimation = false;
              }, 3000);
            }
          },
          error: (err) => console.log(err.error),
          complete: () => discardCardSubscription.unsubscribe(),
        });
    }
  }

  Next() {
    if (this.playingPlayerIndex == 0) {
      const params: HttpParams = new HttpParams()
        .set('playerId', localStorage.getItem('id')!)
        .set('token', localStorage.getItem('token')!);

      const nextSubscription: Subscription = this.matchService
        .Next(params)
        .subscribe({
          next: (callResult) => {
            if (callResult) {
              this.errorMessageAnimation = false;
              this.errorMessage = '';
              (this.myHand = this.matchService.playerNewCards),
                (this.myHandCardCoordinates = []);
              this.MyCardCalc();

              const opponentHandLengthSubscription: Subscription =
                this.matchService.OpponentAIMoves(params).subscribe({
                  next: (opponentMoves) => {
                    console.log('Opponent Moves');
                    console.log(opponentMoves);
                    this.ShowAllOpponentsMoves(opponentMoves);
                  },
                  error: (err) => console.log(err.error),
                  complete: () => opponentHandLengthSubscription.unsubscribe(),
                });
            } else {
              this.errorMessage = this.matchService.errorMessage;
              this.errorMessageAnimation = true;
              setTimeout(() => {
                this.errorMessageAnimation = false;
              }, 3000);
            }
          },
          error: (err) => console.log(err.error),
          complete: () => nextSubscription.unsubscribe(),
        });
    }
  }

  async ShowAllOpponentsMoves(opponentsMoves: Array<IOpponentMove>) {
    this.isMyTurn = false;
    for (let i = 0; i < opponentsMoves.length; i++) {
      if (opponentsMoves[i].WildColor == 'Yellow') {
        this.wildColor = 'orange';
      } else {
        this.wildColor = opponentsMoves[i].WildColor;
      }

      console.log(this.wildColor);

      let playerId = opponentsMoves[i].PlayerId - 1;
      this.playingPlayerIndex = playerId;
      this.opponentHandsLength[playerId] = opponentsMoves[i].HandLength;
      this.lastCard = opponentsMoves[i].LastCard;
      this.lastCardCoordinates = [];
      this.LastCardCalc();

      await this.delay(700);
    }
    this.playingPlayerIndex = 0;
    this.isMyTurn = true;

    if (opponentsMoves[opponentsMoves.length - 1].HandLength == 0) {
      setTimeout(() => {
        this.scoreboardService.ChangeTypeOfScoreboard(0);
        this.router.navigate(['scoreboard']);
      }, 1000);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  ChangeColor(newColorIndex: number) {
    const body: IChangeColorObj = {
      newColor: newColorIndex,
      playerId: parseInt(localStorage.getItem('id')!),
      token: localStorage.getItem('token')!,
    };

    const changeColorSubscription: Subscription = this.matchService
      .ChangeColor(body)
      .subscribe({
        next: (newColor) => {
          this.wildColor = newColor;
          if (this.wildColor == 'yellow') this.wildColor = 'orange';
        },
        error: (err) => console.log(err.error),
        complete: () => changeColorSubscription.unsubscribe(),
      });
    this.changeColorDiscard = false;
  }

  SaveMatch() {
    if (this.playingPlayerIndex == 0) {
      const params: HttpParams = new HttpParams()
        .set('playerId', localStorage.getItem('id')!)
        .set('token', localStorage.getItem('token')!);
      this.matchService.SaveMatch(params);
    }
  }

  UnoClick() {
    this.doYouClicked = true;
    this.unoPopup = false;
  }
}
