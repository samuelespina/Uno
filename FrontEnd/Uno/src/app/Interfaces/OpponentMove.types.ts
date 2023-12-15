import { Card } from './Card.types';

export interface OpponentMove {
  HandLength: number;
  LastCard: Card;
  NextPlayer: number;
  WildColor: string;
}
