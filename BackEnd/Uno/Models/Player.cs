using CardModel;
using DeckModel;
using Newtonsoft.Json;

namespace PlayerModel{
        public class Player{
        public int Id { get; private set;}
        public string Name { get; private set;}
        public string Surname { get; private set;}
        
        [JsonProperty]
        protected List<Card> _hand;
        public List<string> PlayerMoves{get; private set;}


        public Player(int id, string name, string surname){
            Id = id;
            Name = name;
            Surname = surname;
            _hand = new List<Card>();
            PlayerMoves = new List<string>();
        }
        
        public Card EvaluateChosenCard(int cardIndex, Card LastCard, RoundStatus roundStatus, string wildColor){
            if(PlayerMoves.Count == 0){
                if(roundStatus == RoundStatus.Attack){
                    if(_hand[cardIndex].Value == CardValue.DrawFour){
                        PlayerMoves.Add("discard");
                        Card cardToDiscard = _hand[cardIndex];
                        DiscardCard(cardToDiscard);
                        return cardToDiscard;
                    }
                    if(_hand[cardIndex].Value == CardValue.DrawTwo && (_hand[cardIndex].Color.ToString() == wildColor || LastCard.Color == _hand[cardIndex].Color)){
                        PlayerMoves.Add("discard");
                        Card cardToDiscard = _hand[cardIndex];
                        DiscardCard(cardToDiscard);
                        return cardToDiscard;
                    }
                }else{
                    if(_hand[cardIndex].Value == LastCard.Value || (_hand[cardIndex].Color == LastCard.Color || _hand[cardIndex].Color.ToString() == wildColor)){
                        PlayerMoves.Add("discard");
                        Card cardToDiscard = _hand[cardIndex];
                        DiscardCard(cardToDiscard);
                        return cardToDiscard;
                    }else if(_hand[cardIndex].Color == CardColor.Wild){
                        PlayerMoves.Add("discard");
                        Card cardToDiscard = _hand[cardIndex];
                        DiscardCard(cardToDiscard);
                        return cardToDiscard;
                    }
                }
            }else if(PlayerMoves.Count > 0){
                if(PlayerMoves[PlayerMoves.Count -1] == "discard" && LastCard.Score < 10 && _hand[cardIndex].Value == LastCard.Value){
                    PlayerMoves.Add("discard");
                    Card cardToDiscard = _hand[cardIndex];
                    DiscardCard(cardToDiscard);
                    return cardToDiscard;
                }
            }

            throw new Exception("You cant discard this card!");
        }

         public Card DrawCard(Deck deck, List<Card> DiscardPile, int numberOfCardsToDraw = 1,  bool configDraw = false){
            if(PlayerMoves.Count > 0){
                throw new Exception("you can't draw now!");
            }
            
            List<Card> drawnCards = deck.DrawCard(numberOfCardsToDraw);
            drawnCards.ForEach(card => _hand.Add(card));

            if(!deck.EnoughCards())deck.ReShuffle(DiscardPile);
            if (!configDraw) PlayerMoves.Add("draw");

            return _hand[_hand.Count -1];
        }

        protected void DiscardCard(Card cardToRemove){
            _hand.Remove(cardToRemove);
        }

        public bool WinOrNot(){
            return _hand.Count == 0;
        }

        public int ReturnHandLength(){
            return _hand.Count;
        }

        public void ResetPlayerMoves(){
            PlayerMoves.Clear();
        }

        public List<Card> ReturnHandStatus(){
            return _hand;
        }

        public int TakeHandScore(){
            int handScore = 0;
            _hand.ForEach((card)=> handScore += card.Score);
            return handScore;
        }
    }
}