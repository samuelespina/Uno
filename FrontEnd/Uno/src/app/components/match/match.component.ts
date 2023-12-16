import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { HttpParams } from '@angular/common/http';
import { Subscription, timeout } from 'rxjs';
import { Card } from '../../Interfaces/Card.types';
import { StartGame } from '../../Interfaces/StartGame.types';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';
import { DiscardObj } from '../../Interfaces/DiscardObj.types';
import { OpponentMove } from '../../Interfaces/OpponentMove.types';
import { ChangeColorObj } from '../../Interfaces/ChangeColorObj.types';

@Component({
  selector: 'app-match',
  standalone: true,
  templateUrl: './match.component.html',
  styleUrl: './match.component.css',
  imports: [CommonModule, CardComponent],
})
export class MatchComponent implements OnInit {
  myHand!: Array<Card>;
  myHandCardCoordinates: Array<Array<number>> = [];
  opponentHandsLength!: Array<number>;
  lastCard!: Card;
  lastCardCoordinates: Array<Array<number>> = [];
  playingPlayerIndex: number = 0;
  changeColorDiscard: boolean = false;

  constructor(private matchService: MatchService) {}

  ngOnInit(): void {
    const params: HttpParams = new HttpParams()
      .set('playerId', localStorage.getItem('id')!)
      .set('token', localStorage.getItem('token')!);

    if (this.matchService.startGameStatus) {
      const body: StartGame = {
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

  DrawCard() {
    if (this.playingPlayerIndex == 0) {
      const params: HttpParams = new HttpParams()
        .set('playerId', localStorage.getItem('id')!)
        .set('token', localStorage.getItem('token')!);

      const drawCardSubscription: Subscription = this.matchService
        .DrawCard(params)
        .subscribe({
          next: (newCard: Card) => {
            console.log(newCard);
            this.myHand.push(newCard);
            this.myHandCardCoordinates = [];
            this.MyCardCalc();
          },
          error: (err) => console.log(err.error),
          complete: () => drawCardSubscription.unsubscribe(),
        });
    }
  }

  DiscardCard(cardIndex: number) {
    const body: DiscardObj = {
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
        next: (res) => {
          this.myHand.splice(cardIndex, 1);
          this.myHandCardCoordinates.splice(cardIndex, 1);
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
              },
              error: (err) => console.log(err),
              complete: () => TakeLastCardSubscription.unsubscribe(),
            });
        },
        error: (err) => console.log(err.error),
        complete: () => discardCardSubscription.unsubscribe(),
      });
  }

  Next() {
    if (this.playingPlayerIndex == 0) {
      const params: HttpParams = new HttpParams()
        .set('playerId', localStorage.getItem('id')!)
        .set('token', localStorage.getItem('token')!);

      const nextSubscription: Subscription = this.matchService
        .Next(params)
        .subscribe({
          next: (playerNewCard: Array<Card>) => {
            (this.myHand = playerNewCard), (this.myHandCardCoordinates = []);
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
          },
          error: (err) => console.log(err.error),
          complete: () => nextSubscription.unsubscribe(),
        });
    }
  }

  async ShowAllOpponentsMoves(opponentsMoves: Array<OpponentMove>) {
    for (let i = 0; i < opponentsMoves.length; i++) {
      this.opponentHandsLength[opponentsMoves[i].PlayerId - 1] =
        opponentsMoves[i].HandLength;
      this.lastCard = opponentsMoves[i].LastCard;
      this.lastCardCoordinates = [];
      this.LastCardCalc();

      await this.delay(2000);
    }
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  ChangeColor(newColorIndex: number) {
    const body: ChangeColorObj = {
      newColor: newColorIndex,
      playerId: parseInt(localStorage.getItem('id')!),
      token: localStorage.getItem('token')!,
    };

    this.matchService.ChangeColor(body);
  }
}
