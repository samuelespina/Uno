using System.Text.RegularExpressions;
using CardModel;
using DeckModel;
using PlayerModel;

namespace OpponentAIModel{
        public class OpponentAI : Player{
        public OpponentAI(int Id = 0, string Name = "", string Surname = "") : base(Id, Name, Surname){}

        public List<Card> MakeGameMoves(RoundStatus RoundStatus, List<Card> DiscardPile, int nextPlayerHandLength, ref string WildColor, Deck deck){
            List<Card> gameMoves = new List<Card>();
            Card LastCard = DiscardPile[DiscardPile.Count -1];

            if(_hand.Count == 1 && _hand[0].Color == CardColor.Wild){
                if(RoundStatus == RoundStatus.Attack){
                    throw new Exception();
                }

                DrawCard(deck, DiscardPile);
            }

            if(RoundStatus == RoundStatus.Attack){

                Card newAttackCard = Attack(LastCard, ref WildColor);
                gameMoves.Add(newAttackCard);
                DiscardCard(newAttackCard);
                return gameMoves;

            }else if(nextPlayerHandLength <= 3 && RoundStatus == RoundStatus.Normal){
                
                Card SkipOrReverse = FindCardThatMatch(new List<Card>(){new Card(LastCard.Color, CardValue.Skip, 20), new Card(LastCard.Color, CardValue.Reverse, 20)}, ref WildColor, true);
                Card StrategicDrawFourOrDrawTwo = FindCardThatMatch(new List<Card>(){new Card(CardColor.Wild, CardValue.DrawFour, 50), new Card(LastCard.Color, CardValue.DrawTwo, 20)}, ref WildColor, true);
                
                if(SkipOrReverse != null){
                    gameMoves.Add(SkipOrReverse);
                    DiscardCard(SkipOrReverse);
                    return gameMoves;
                }else if(StrategicDrawFourOrDrawTwo != null){
                    if(StrategicDrawFourOrDrawTwo.Value == CardValue.DrawFour){
                        WildColor = ChoseColor();
                    }
                    gameMoves.Add(StrategicDrawFourOrDrawTwo);
                    DiscardCard(StrategicDrawFourOrDrawTwo);
                    return gameMoves;
                }
            }
            
            List<Card> NumbersSequence = FindNumberSequence(LastCard);
            if(NumbersSequence != null){
                    NumbersSequence.ForEach(card => DiscardCard(card));
                    return NumbersSequence;
            }
            
            Card DrawFourOrDrawTwo = FindCardThatMatch(new List<Card>(){new Card(CardColor.Wild, CardValue.DrawFour, 50), new Card(LastCard.Color, CardValue.DrawTwo, 20)}, ref WildColor, true);
            Card NormalCard = FindCardThatMatch(new List<Card>(){LastCard}, ref WildColor);

            Random random = new Random();
            int randomChoise = random.Next(2);

            if(randomChoise == 0 && DrawFourOrDrawTwo != null){
                if(DrawFourOrDrawTwo.Value == CardValue.DrawFour){
                        WildColor = ChoseColor();
                    }
                gameMoves.Add(DrawFourOrDrawTwo);
                DiscardCard(DrawFourOrDrawTwo);
                return gameMoves;
            }else if(randomChoise == 1 && NormalCard != null){
                gameMoves.Add(NormalCard);
                DiscardCard(NormalCard);
                return gameMoves;
            }else if(randomChoise == 0 && DrawFourOrDrawTwo == null && NormalCard != null){
                gameMoves.Add(NormalCard);
                DiscardCard(NormalCard);
                return gameMoves;
            }else if(randomChoise == 1 && NormalCard == null && DrawFourOrDrawTwo != null){
                if(DrawFourOrDrawTwo.Value == CardValue.DrawFour){
                        WildColor = ChoseColor();
                    }
                gameMoves.Add(DrawFourOrDrawTwo);
                DiscardCard(DrawFourOrDrawTwo);
                return gameMoves;
            }else if(NormalCard == null && DrawFourOrDrawTwo == null){
                Card FindWild = FindCardThatMatch(new List<Card>(){new Card(CardColor.Wild, CardValue.Wild, 50)}, ref WildColor, true);
                if(FindWild != null){
                    WildColor = ChoseColor();
                    gameMoves.Add(FindWild);
                    DiscardCard(FindWild);
                    return gameMoves;
                }
                DrawCard(deck, DiscardPile);
                Card lastChanceCard = FindCardThatMatch(new List<Card>(){LastCard}, ref WildColor);
                if(lastChanceCard != null){
                    gameMoves.Add(lastChanceCard);
                    DiscardCard(lastChanceCard);
                    return gameMoves;
                }
            }

            throw new Exception();
        }

        private Card Attack(Card LastCard, ref string WildColor){
            for(int i = 0; i < _hand.Count; i++){
                if(_hand[i].Value == CardValue.DrawFour){
                    WildColor = ChoseColor();
                    return _hand[i];
                }else if(LastCard.Value == CardValue.DrawFour && _hand[i].Value == CardValue.DrawTwo && _hand[i].Color.ToString() == WildColor){
                    return _hand[i];
                }else if(LastCard.Value == CardValue.DrawTwo  && _hand[i].Value == CardValue.DrawTwo){
                    return _hand[i];
                }
            }

            throw new Exception();
        }

        private string ChoseColor(){
            Dictionary<CardColor, int> colorCounts = new Dictionary<CardColor, int>();

            foreach (Card card in _hand)
            {
                if (colorCounts.ContainsKey(card.Color)){
                    colorCounts[card.Color]++;
                }else if(card.Color != CardColor.Wild){
                    colorCounts[card.Color] = 1;
                }
            }

            int mostCard = 0;
            CardColor newColor = new();

            foreach (var color in colorCounts){

                if (color.Value > mostCard)
                {
                    mostCard = color.Value;
                    newColor = color.Key;
                }
            }

            return newColor.ToString();
        }

        private Card FindCardThatMatch(List<Card> cardsToMatch, ref string WildColor, bool exactlyMatch = false){
            if(WildColor != ""){
                    for(int i = 0; i < cardsToMatch.Count; i++){
                        for(int j = 0; j < _hand.Count; j++){
                            if(!exactlyMatch && _hand[j].Color.ToString() == WildColor){
                                return _hand[j];
                            }else if(exactlyMatch && (_hand[j].Value == cardsToMatch[i].Value && _hand[j].Color.ToString() == WildColor)){
                                return _hand[j];
                            }
                            else if(exactlyMatch && (cardsToMatch[i].Value == CardValue.DrawFour && _hand[j].Value == CardValue.DrawFour) || (cardsToMatch[i].Value == CardValue.Wild && _hand[j].Value == CardValue.Wild)){
                                return _hand[j];
                            }
                        }
                    }
            }else{
                for(int i = 0; i < cardsToMatch.Count; i++){
                    for(int j = 0; j < _hand.Count; j++){
                        if(!exactlyMatch && (_hand[j].Value == cardsToMatch[i].Value || _hand[j].Color == cardsToMatch[i].Color)){
                            return _hand[j];
                        }else if(exactlyMatch && (_hand[j].Value == cardsToMatch[i].Value && _hand[j].Color == cardsToMatch[i].Color)){
                            return _hand[j];
                        }
                    }
                }
            }
            return null;
        }

        public List<Card> FindNumberSequence(Card LastCard){
            
            List<Card> cardsSequence = new List<Card>();

            if(LastCard.Score < 10){
                for(int i = 0; i < _hand.Count; i++){
                    if(_hand[i].Value == LastCard.Value){
                        cardsSequence.Add(_hand[i]);
                    }
                }            
            }

            if(cardsSequence.Count >= 2){
                return cardsSequence;
            }

            return null;
        }
    }
}