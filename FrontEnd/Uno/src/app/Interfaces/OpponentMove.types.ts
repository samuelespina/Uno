import { Card } from './Card.types';

export interface OpponentMove {
  HandLength: number;
  LastCard: Card;
  PlayerId: number;
  WildColor: string;
}
