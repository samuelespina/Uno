using CardModel;

public enum CardColor
{
    Red,
    Yellow,
    Green,
    Blue,
    Wild
}

public enum CardValue
{
    Zero,
    One,
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Skip,
    Reverse,
    DrawTwo,
    DrawFour,
    Wild
}

namespace DeckModel{
    public class Deck{
        private List<Card> _cards;

        public Deck(){
            _cards = new List<Card>();
            InitializeDeck();
            Shuffle();
        }

        public void InitializeDeck(){

            foreach (CardColor color in Enum.GetValues(typeof(CardColor)))//ciclo per colore 
            {
                if (color != CardColor.Wild) //creo solo carte non wild
                {
                    foreach (CardValue value in Enum.GetValues(typeof(CardValue)))
                    {
                        switch (value)
                        {   //se il valore è un reverse, skip o drawTwo ne creo 2 e metto lo score
                            case CardValue.Reverse:
                            case CardValue.Skip:
                            case CardValue.DrawTwo:
                            _cards.Add(new Card(color, value, 20));
                            _cards.Add(new Card(color, value, 20));
                            break;

                            case CardValue.Zero: //se il valore è zero allora la creo solo una volta 
                            
                            _cards.Add(new Card(color, value, (int)value));
                            break;

                            //in tutti gli altri casi (che non siano wild o drawFour) creo 2 carte usando l'index dei valori dell'enum
                            case CardValue.One:
                            case CardValue.Two:
                            case CardValue.Three:
                            case CardValue.Four:
                            case CardValue.Five:
                            case CardValue.Six:
                            case CardValue.Seven:
                            case CardValue.Eight:
                            case CardValue.Nine:
                                
                            _cards.Add(new Card(color, value, (int)value));
                            _cards.Add(new Card(color, value, (int)value));
                            break;
                        }
                    }
                }
                else //alla fine creo i wild e drawFour, di ognuno ne creo 4, 1 per ogni colore
                {
                    
                    for (int i = 1; i <= 4; i++)
                    {
                        _cards.Add(new Card(color, CardValue.Wild, 50));
                    }
                    
                    for (int i = 1; i <= 4; i++)
                    {
                        _cards.Add(new Card(color, CardValue.DrawFour, 50));
                    }
                }
            }
        }

        public void Shuffle(){
            Random random = new Random();

            for (int i = 0; i < _cards.Count; i++){
                int randomIndex = random.Next(i + 1);
                Card currentCard = _cards[i];
                _cards[i] = _cards[randomIndex];
                _cards[randomIndex] = currentCard;
            }
        }

        public void ReShuffle(List<Card> discardPile){
            _cards = _cards.Concat(discardPile).ToList();
            Shuffle();
        }

        public bool EnoughCards(int numberOfCards = 1){
            return _cards.Count > numberOfCards;
        }

        public List<Card> DrawCard(int numberOfCardToDraw = 1){
            List<Card> cards = new List<Card>();

            for(int i = 0; i < numberOfCardToDraw; i++){
                Card cardToDraw = _cards.First();
                _cards.Remove(cardToDraw);
                cards.Add(cardToDraw);
            }

            return cards;
        }
    }
}
