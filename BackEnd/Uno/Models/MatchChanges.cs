using CardModel;

namespace MatchChangesModel{
    public class MatchChanges{
        public int HandLength;
        public Card LastCard;
        public int PlayerId;
        public string WildColor;

        public MatchChanges(int handLength, Card lastCard){
            HandLength = handLength;
            LastCard = lastCard;
        }

        public void SetPlayerId (int playerId){
            PlayerId = playerId;
        }

        public void SetWildColor (string wildColor){
            WildColor = wildColor;
        }

        //test

        public override string ToString()
        {
            return $"\nHand length : {HandLength}\nLast card : {LastCard.ToString()}\nNext player : {PlayerId}\nWild color : {WildColor}\n\n";
        }
    }
}