import { ICard } from './ICard.types';

export interface IOpponentMove {
  HandLength: number;
  LastCard: ICard;
  PlayerId: number;
  WildColor: string;
}
