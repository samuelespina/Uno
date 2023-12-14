namespace CardModel{
    public class Card{
        public CardColor Color;
        public CardValue Value;
        public int Score;

        public Card(CardColor color, CardValue value, int score){
            Color = color;
            Value = value;
            Score = score;
        }

        public override string ToString(){
            return $"{Color.ToString()} {Value.ToString()} {Score}";
        }
    }
}