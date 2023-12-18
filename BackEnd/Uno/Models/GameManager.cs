using System.Collections.Concurrent;
using CardModel;
using MatchChangesModel;
using MatchModel;
using PlayerModel;
using filemanager;

namespace GameManagerModel{
    public class GameManager{
        private ConcurrentBag<Match> _pendingMatches;
        private List<Match> _finishedMatches;
        private FileManager fileManager;

        public GameManager(){
            fileManager = FileManager.Instance;
            _pendingMatches = fileManager.DeserializeFromJsonFile<ConcurrentBag<Match>>("../FileManager/GameFilesJson/PendingMatches.json") ?? new ConcurrentBag<Match>();
            _finishedMatches = fileManager.DeserializeFromJsonFile<List<Match>>("../FileManager/GameFilesJson/FinishedMatches.json") ?? new List<Match>();
        }

        public List<Card> StartGame(int botNumber, Player player){
            foreach (Match match in _pendingMatches){
                if(match.hostId == player.Id){
                    throw new Exception("You already have a pendent match");
                }
            }

            Match newMatch = new Match(player.Id);
            List<Card> playerCards = newMatch.SetPlayers(player, botNumber);
            _pendingMatches.Add(newMatch);
            return playerCards;
        }

        private Match FindMyMatch(int playerId){

            foreach (Match match in _pendingMatches){
                if(match.hostId == playerId){
                    return match;
                }
            }
            throw new Exception("Match not found");
        }

        public Card DrawCard(int playerId, bool typeOfDraw){
            Match myMatch = FindMyMatch(playerId);
            return myMatch.DrawCard(1, typeOfDraw);
        }

        public void DiscardCard(int playerId, int cardIndex){
            Match myMatch = FindMyMatch(playerId);
            int playerHandLength = myMatch.DiscardCard(cardIndex);

            if(playerHandLength == 0){
                TransferToFinishedMatches(myMatch);
            }
        }

        public List<MatchChanges> OpponentAIGameMoves(int matchId){
            Match myMatch = FindMyMatch(matchId);
            List<MatchChanges> opponentMoves = myMatch.OpponentAIGameMoves();
            if(opponentMoves[opponentMoves.Count -1].HandLength == 0){
                TransferToFinishedMatches(myMatch);
            }

            return opponentMoves;
        }

        public List<Card> Next(int matchId){
            Match myMatch = FindMyMatch(matchId);
            List<Card> playerNewCards = myMatch.Next();
            return playerNewCards;
        }

        public string ChangeColor(int newColor, int matchId){
            Match myMatch = FindMyMatch(matchId);
            return myMatch.ChangeColor(newColor);
        }

        public SortedList<int, List<int>> TakeLastScoreboard(int playerId){
            Match lastMatch = null;

            foreach (Match match in _finishedMatches){
                if(match.hostId == playerId){
                    lastMatch = match;
                }
            }

            if(lastMatch != null) return lastMatch.ScoreBoard; 

            throw new Exception("Scoreboard not found");
        }

        public SortedList<decimal, List<string>> WatchLeaderBoard(){
            List<Player> players = new List<Player>();

            _finishedMatches.ForEach((match) =>
                {
                    Player playerToAdd = match.Players[0];
                    if (!players.Any(p => p.Id == playerToAdd.Id))
                    {
                        players.Add(playerToAdd);
                    }
                });

            SortedList<decimal, List<string>> leaderBoard = new();

            players.ForEach((player)=>{
                decimal numberOfMatchs = 0;
                decimal numberOfWins = 0;

                _finishedMatches.ForEach((match)=>{
                    if(player.Id == match.hostId){
                        numberOfMatchs++;
                        if(match.ScoreBoard[0][0] == 0){
                            numberOfWins++;
                        }
                    }
                });
                decimal average = numberOfMatchs / numberOfWins;

                if(!leaderBoard.ContainsKey(average)){
                    leaderBoard[average] = new List<string>();
                }
                leaderBoard[average].Add($"{player.Name} {player.Surname}");
            });

            return leaderBoard;
        }

        public void TransferToFinishedMatches(Match myMatch){
            _finishedMatches.Add(myMatch);
                
            Parallel.ForEach(_pendingMatches, (match)=>{
                if(match == myMatch){
                    _pendingMatches.TryTake(out Match removedElement);
                }
            });
            fileManager.SerializeToJsonFile(_finishedMatches, "../FileManager/GameFilesJson/FinishedMatches.json");
            fileManager.SerializeToJsonFile(_pendingMatches, "../FileManager/GameFilesJson/PendingMatches.json");
        }
        public void SaveMatch(){
            fileManager.SerializeToJsonFile(_pendingMatches, "../FileManager/GameFilesJson/PendingMatches.json");
        }

        public List<Card> ReturnHandStatus(int playerId){
            Match myMatch = FindMyMatch(playerId);
            return myMatch.ReturnHandStatus();
        }

        public List<int> TakeOpponentHandLength(int playerId){
            Match myMatch = FindMyMatch(playerId);
            return myMatch.TakeOpponentHandLength();
        }

        public Card TakeLastCard(int playerId){
            Match myMatch = FindMyMatch(playerId);
            return myMatch.TakeLastCard();
        }
    }
}