using GameManagerModel;
using Microsoft.AspNetCore.Mvc;
using PlayerModel;
using CardModel;
using MatchChangesModel;
using Newtonsoft.Json;
using MatchModel;
using System.Text.Json;

namespace GameManagerService{
    public class GameManagerController : Controller{
        
        private GameManager _gameManager;
        private readonly HttpClient _client;
        private readonly string _authAPI = "http://localhost:5006";
        public GameManagerController(GameManager gameManager){
            _client = new();
            _gameManager = gameManager;
        }

        private async Task<string> VerifyTokenCall(string token)
        {
            using (HttpClient client = new HttpClient())
            {
                string apiUrl = $"{_authAPI}/api/UserService/verifyToken?token={token}";

                try
                {
                    HttpResponseMessage response = await _client.GetAsync(apiUrl);
                    if (response.IsSuccessStatusCode)
                    {
                        string data = await response.Content.ReadAsStringAsync();
                        return data;
                    }
                }
                catch (HttpRequestException e)
                {
                    return $"{e.Message}";
                }
            }

            return "";
        }

        [HttpPost]
        [Route("/api/[controller]/startGame")]
        public async Task<IActionResult> StartGame([FromBody] JsonElement request){
            
            if (request.TryGetProperty("botNumber", out var botNumberElement)
                && request.TryGetProperty("playerId", out var playerIdElement)
                && request.TryGetProperty("name", out var nameElement)
                && request.TryGetProperty("surname", out var surnameElement)
                && request.TryGetProperty("token", out var tokenElement))
            {

                int botNumber = botNumberElement.GetInt16();
                int playerId = playerIdElement.GetInt16();
                string name = nameElement.GetString()!;
                string surname = surnameElement.GetString()!;
                string token = tokenElement.GetString()!;


                string userId = await VerifyTokenCall(token);

                if(userId == "" || int.Parse(userId) != playerId)
                {
                    return Unauthorized("You're not verified");
                }

                try{
                    if(botNumber > 5 || botNumber < 1){//to put 5/4
                        throw new Exception("you can't start the game with this number of oppontent!");
                    }
                    Player player = new Player(playerId, name, surname);
                    List<Card> newPlayerCards = _gameManager.StartGame(botNumber, player);
                    return Ok(JsonConvert.SerializeObject(newPlayerCards));
                }catch(Exception e){
                    return BadRequest(e.Message);
            }
            }
            return BadRequest();
        }

        [HttpGet]
        [Route("/api/[controller]/drawCard")]
        public async Task<IActionResult> DrawCard([FromQuery] int playerId, [FromQuery] string token){

            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                Card newCard = _gameManager.DrawCard(playerId);
                return Content(JsonConvert.SerializeObject(newCard));
            }
            catch(Exception e){
                return BadRequest(e.Message);
            }
        }

        [HttpPost]
        [Route("/api/[controller]/discardCard")]
        public async Task<IActionResult> DiscardCard([FromBody] JsonElement request){

            if (request.TryGetProperty("playerId", out var playerIdElement)
                && request.TryGetProperty("cardIndex", out var cardIndexElement)
                && request.TryGetProperty("token", out var tokenElement))
            {

                int playerId = playerIdElement.GetInt16();
                byte cardIndex = cardIndexElement.GetByte()!;
                string token = tokenElement.GetString()!;

            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                _gameManager.DiscardCard(playerId, cardIndex);
                return Ok();
            }catch(Exception e){
                return BadRequest(e.Message);
            }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("/api/[controller]/next")]
        public async Task<IActionResult> Next([FromQuery] int playerId, [FromQuery] string token){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                List<Card> playerNewCards = _gameManager.Next(playerId);
                return Ok(JsonConvert.SerializeObject(playerNewCards));
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }       

        [HttpGet]
        [Route("/api/[controller]/getOpponentAIGameMoves")]
        public async Task<IActionResult> GetOpponentAIGameMoves([FromQuery] int matchId, [FromQuery] string token){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != matchId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                List<MatchChanges> result = _gameManager.OpponentAIGameMoves(matchId);
                return Ok(JsonConvert.SerializeObject(result));
            }
            catch(Exception e){
                return BadRequest(e.StackTrace);
            }
        }

        [HttpGet]
        [Route("/api/[controller]/takeMyLastScoreboard")]
        public async Task<IActionResult> TakeLastScoreboard([FromQuery] int playerId, [FromQuery] string token){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                SortedList<int, List<int>> lastScoreboard = _gameManager.TakeLastScoreboard(playerId);
                return Ok(JsonConvert.SerializeObject(lastScoreboard));
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Route("/api/[controller]/takeAllMyScoreboards")]
        public async Task<IActionResult> TakeAllMyScoreboards([FromQuery] int playerId, [FromQuery] string token){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                List<SortedList<int, List<int>>> lastScoreboard = _gameManager.TakeAllMyScoreBoards(playerId);
                return Ok(JsonConvert.SerializeObject(lastScoreboard));
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Route("/api/[controller]/watchLeaderBoard")]
        public async Task<IActionResult> WatchLeaderBoard([FromQuery] string token, [FromQuery] int playerId){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                SortedList<decimal, List<string>> lastScoreboard = _gameManager.WatchLeaderBoard();
                return Ok(JsonConvert.SerializeObject(lastScoreboard));
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }

        /*------------------ RESUME MATCH API ------------------*/

        [HttpGet]
        [Route("/api/[controller]/saveMatch")]
        public async Task<IActionResult> SaveMatch([FromQuery] string token, [FromQuery] int playerId){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                _gameManager.SaveMatch();
                return Ok();
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Route("/api/[controller]/resume")]
        public async Task<IActionResult> Resume([FromQuery] int playerId, [FromQuery] string token){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                List<Card> myHand =_gameManager.ReturnHandStatus(playerId);
                return Ok(JsonConvert.SerializeObject(myHand));
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Route("/api/[controller]/takeLastCard")]
        public async Task<IActionResult> TakeLastCard([FromQuery] int playerId, [FromQuery] string token){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                Card lastCard = _gameManager.TakeLastCard(playerId);
                return Ok(JsonConvert.SerializeObject(lastCard));
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }

        [HttpGet]
        [Route("/api/[controller]/takeOpponentHandLength")]
        public async Task<IActionResult> TakeOpponentHandLength([FromQuery] int playerId, [FromQuery] string token){
            string userId = await VerifyTokenCall(token);

            if(userId == "" || int.Parse(userId) != playerId)
            {
                return Unauthorized("You're not verified");
            }

            try{
                return Ok(_gameManager.TakeOpponentHandLength(playerId));
            }catch(Exception e){
                return BadRequest(e.Message);
            }
        }
    }
}