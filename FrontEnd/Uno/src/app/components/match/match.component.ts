import { Component, OnInit } from '@angular/core';
import { MatchService } from '../../services/match.service';
import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Card } from '../../Interfaces/Card.types';
import { StartGame } from '../../Interfaces/StartGame.types';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../card/card.component';

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
            this.CardCalc();
            console.log('START MATCH ' + this.myHand);
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
                        console.log('LAST CARD ' + this.lastCard);
                      },
                      error: (err) => console.log(err),
                      complete: () =>
                        opponentHandLengthSubscription.unsubscribe(),
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
            this.CardCalc();
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
                        console.log('LAST CARD ' + this.lastCard);
                      },
                      error: (err) => console.log(err),
                      complete: () =>
                        opponentHandLengthSubscription.unsubscribe(),
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

  CardCalc() {
    for (let i = 0; i < this.myHand.length; i++) {
      let cardCoordinates: Array<number> = [];
      if (this.myHand[i].Value >= 0 && this.myHand[i].Value <= 9) {
        let number = 140 * this.myHand[i].Value + 19;
        cardCoordinates.push(number);
      } else {
        cardCoordinates.push(0);
      }
      if (this.myHand[i].Color != 4) {
        let color = 210 * this.myHand[i].Color + 15;
        cardCoordinates.push(color);
      } else {
        cardCoordinates.push(0);
      }
      this.myHandCardCoordinates.push(cardCoordinates);
    }
  }
}