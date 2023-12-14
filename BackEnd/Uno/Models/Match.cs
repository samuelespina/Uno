using PlayerModel;
using OpponentAIModel;
using DeckModel;
using CardModel;
using MatchChangesModel;
using Newtonsoft.Json;

public enum RoundStatus{
    Normal,
    Attack,
    Reverse,
    Skip
}

namespace MatchModel{
    public class Match{
        public List<Player> Players { get; private set; }
        private Deck _deck;
        public List<Card> DiscardPile{ get; private set; }
        public int hostId { get;private set; }
        public int PlayingPlayerIndex;
        public RoundStatus RoundStatus { get; private set; }
        public int AttackStreak;
        public bool GameRoundDirection;
        public string WildColor;
        public SortedList<int, List<int>> ScoreBoard;

        [JsonConstructor]
        public Match(List<Player> Players, Deck _deck, List<Card> DiscardPile, int hostId, int PlayingPlayerIndex, RoundStatus RoundStatus, int AttackStreak, bool GameRoundDirection, string WildColor, SortedList<int, List<int>> ScoreBoard){
            this.Players = Players;
            this._deck = _deck;
            this.DiscardPile = DiscardPile;
            this.hostId = hostId;
            this.PlayingPlayerIndex = PlayingPlayerIndex;
            this.RoundStatus = RoundStatus;
            this.AttackStreak = AttackStreak;
            this.GameRoundDirection = GameRoundDirection;
            this.WildColor = WildColor;
            this.ScoreBoard = ScoreBoard;
        }
        public Match(int id){
            Players = new();
            _deck = new Deck();
            DiscardPile = new List<Card>();
            hostId = id;
            PlayingPlayerIndex = 0;
            RoundStatus = RoundStatus.Normal;
            AttackStreak = 0;
            GameRoundDirection = true;
            WildColor = "";
            ScoreBoard = new SortedList<int, List<int>>();
        }

        /*----------------- CONFIGURATIONS -----------------*/
        
        public List<Card> SetPlayers(Player player, int botNumber){
            // Players.Add(player);
            for(int i = 0; i < botNumber; i++){
                Players.Add(new OpponentAI());
            }
            ConfigPlayersHand();
            ConfigStartCard();

            return Players[PlayingPlayerIndex].ReturnHandStatus();
        }

        private void ConfigStartCard(){
            bool goodStartCard = false;
            do{
                List<Card> firstCardOnTable = _deck.DrawCard();
                DiscardPile.Add(firstCardOnTable[0]);
                if(firstCardOnTable[0].Color != CardColor.Wild){
                    goodStartCard = true;
                }
            }while(!goodStartCard);
        }

        private void ConfigPlayersHand(){
            for(PlayingPlayerIndex = 0; PlayingPlayerIndex < Players.Count; PlayingPlayerIndex++){  
                DrawCard(7, true);
            }
            PlayingPlayerIndex = 0;
        }


        /*----------------- GAME MOVES-----------------*/

        public Card DrawCard(int numberOfCardToDraw = 1, bool configDraw = false){
            Card newCard = Players[PlayingPlayerIndex].DrawCard(_deck, DiscardPile, numberOfCardToDraw, configDraw);
            return newCard;
        }

        public void DiscardCard(int cardIndex){
            Card discardCard = Players[PlayingPlayerIndex].EvaluateChosenCard(cardIndex, DiscardPile[DiscardPile.Count -1], RoundStatus, WildColor);
            DiscardPile.Add(discardCard);
        }

        public List<Card> Next(){
            Players[PlayingPlayerIndex].ResetPlayerMoves();

            if(RoundStatus == RoundStatus.Attack){
                if(!_deck.EnoughCards(AttackStreak)){
                        _deck.ReShuffle(DiscardPile);
                    }
                DrawCard(AttackStreak, true);
                AttackStreak = 0;
                RoundStatus = RoundStatus.Normal;
                RoundCicleManagement();
            }

            RoundStateManagement();
            List<Card> playerNewCards = Players[PlayingPlayerIndex].ReturnHandStatus();
            if(playerNewCards.Count == 0){
                //creare la scoreboard
                CreateScoreBoard();
            }
            RoundCicleManagement();
            
            return playerNewCards;
        }

        public List<MatchChanges> OpponentAIGameMoves(){
            List<MatchChanges> AllChanges = new();

            while(Players[PlayingPlayerIndex].GetType() == typeof(OpponentAI)){
                try{
                    //se l'opponentAI può buttare carte:
                    OpponentAI currentAI = (OpponentAI)Players[PlayingPlayerIndex];
                    int nextPlayerHandLength = NextPlayerHandLength();
                    List<Card> discardCards = currentAI.MakeGameMoves(RoundStatus, DiscardPile, nextPlayerHandLength, ref WildColor, _deck);
                    discardCards.ForEach(card => DiscardPile.Add(card));
                    RoundStateManagement();

                }catch{
                    //se non ne ha potute buttare:
                    if(RoundStatus == RoundStatus.Attack){
                        if(!_deck.EnoughCards(AttackStreak)){
                            _deck.ReShuffle(DiscardPile);
                        }
                        DrawCard(AttackStreak, true);
                        AttackStreak = 0;
                    }

                    RoundStatus = RoundStatus.Normal;
                }

                if(DiscardPile[DiscardPile.Count -1].Color != CardColor.Wild){
                    WildColor = "";
                }
                AllChanges.Add(new MatchChanges(Players[PlayingPlayerIndex].ReturnHandLength(), DiscardPile[DiscardPile.Count -1]));
                AllChanges[AllChanges.Count -1].SetWildColor(WildColor);

                if(Players[PlayingPlayerIndex].WinOrNot()){
                    //calcolo della scoreboard
                    CreateScoreBoard();
                    break;
                }

                Players[PlayingPlayerIndex].ResetPlayerMoves();
                RoundCicleManagement();
                AllChanges[AllChanges.Count -1].SetNextPlayer(PlayingPlayerIndex);
            }
            return AllChanges;
        }

        public void CreateScoreBoard(){
            for(int i = 0; i < Players.Count; i++){
                int handScore = Players[i].TakeHandScore();

                if (!ScoreBoard.ContainsKey(handScore))
                {
                    ScoreBoard[handScore] = new List<int>();
                }

                ScoreBoard[handScore].Add(i);
            }
        }


        /*----------------- GAME CICLE MANAGEMENT -----------------*/

        private void RoundStateManagement(){
            switch(DiscardPile[DiscardPile.Count -1].Value){
                case CardValue.Reverse:
                    RoundStatus = RoundStatus.Reverse;
                    break;
                case CardValue.DrawTwo:
                    AttackStreak += 2;
                    RoundStatus = RoundStatus.Attack;
                    break;
                case CardValue.DrawFour:
                    AttackStreak += 4;
                    RoundStatus = RoundStatus.Attack;
                    break;
                case CardValue.Skip:
                    RoundStatus = RoundStatus.Skip;
                    break;
                default:
                    RoundStatus = RoundStatus.Normal;
                    break;
            }
        }

        private void NextRound(int numberOfRound = 1){
            PlayingPlayerIndex = GameRoundDirection ? PlayingPlayerIndex + numberOfRound : PlayingPlayerIndex - numberOfRound;
            int newPlayingPlayerIndex = (PlayingPlayerIndex % Players.Count + Players.Count) % Players.Count;
            PlayingPlayerIndex = newPlayingPlayerIndex;
        }
        
        private void ChangeGameDirection(){
            GameRoundDirection = !GameRoundDirection;
        }

        private void RoundCicleManagement(){
            switch(RoundStatus){
                case RoundStatus.Reverse:
                    ChangeGameDirection();
                    NextRound();
                    break;
                case RoundStatus.Skip:
                    NextRound(2);
                    RoundStatus = RoundStatus.Normal;
                    break;
                default:
                    NextRound();
                    break;
            }
        }

        private int NextPlayerHandLength(){
            int currentPlayingPlayerIndex = PlayingPlayerIndex;
            NextRound();
            int nextPlayerHandLength = Players[PlayingPlayerIndex].ReturnHandLength();
            PlayingPlayerIndex = currentPlayingPlayerIndex;
            return nextPlayerHandLength;
        }

        public List<Card> ReturnHandStatus(){
            return Players[PlayingPlayerIndex].ReturnHandStatus();
        }

        public List<int> TakeOpponentHandLength(){
            List<int> allHandsLentgh = new List<int>();
            Players.ForEach((player)=> allHandsLentgh.Add(player.ReturnHandLength()));
            return allHandsLentgh;
        }

        public Card TakeLastCard(){
            return DiscardPile[DiscardPile.Count -1];
        }
    }
}
