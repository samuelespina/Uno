using CardModel;

namespace MatchChangesModel{
    public class MatchChanges{
        public int HandLength;
        public Card LastCard;
        public int NextPlayer;
        public string WildColor;

        public MatchChanges(int handLength, Card lastCard){
            HandLength = handLength;
            LastCard = lastCard;
        }

        public void SetNextPlayer (int nextPlayer){
            NextPlayer = nextPlayer;
        }

        public void SetWildColor (string wildColor){
            WildColor = wildColor;
        }

        //test

        public override string ToString()
        {
            return $"\nHand length : {HandLength}\nLast card : {LastCard.ToString()}\nNext player : {NextPlayer}\nWild color : {WildColor}\n\n";
        }
    }
}