using Microsoft.AspNetCore.Mvc;
using Authentication.UserServiceModels;
using System.Text.Json;


namespace Authentication.Controllers
{
    public class UserServiceController : Controller
    {
        
        private UserService _userService;//dependency injection

        public UserServiceController(UserService userService)
        {
            _userService = userService;
        }

        /*-------------------- AUTH API --------------------*/

        [HttpPost]
        [Route("/api/[controller]/signup/")]
        public IActionResult SignUp([FromBody] JsonElement request)
        {
            if (request.TryGetProperty("name", out var nameElement)
                && request.TryGetProperty("surname", out var surnameElement)
                && request.TryGetProperty("email", out var emailElement))
            {

                string name = nameElement.GetString();
                string surname = surnameElement.GetString();
                string email = emailElement.GetString();
                

                bool result = _userService.AddNewUser(name, surname, email, "user");//rimettere "user"
                if (result)
                {
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("/api/[controller]/generateChallenge/")]
        [Consumes("application/json")]
        public IActionResult FindUserAndGenerateChallenge([FromBody] JsonElement request)
        {
            if (request.TryGetProperty("email", out var emailElement)){
                string email = emailElement.GetString();

                int challenge = _userService.GenerateChallenge(email);
                if (challenge == 0)
                {
                    return BadRequest();
                }
                else
                {
                    return Json(challenge);
                }
            }
            return BadRequest();
        }

        [HttpPost]
        [Route("/api/[controller]/verifyCredentials/")]
        public IActionResult VerifyCredentials([FromBody] JsonElement request)
        {
            if (request.TryGetProperty("email", out var emailElement)
                && request.TryGetProperty("password", out var passwordWithChallengeElement))
            {
                string email = emailElement.GetString();
                string passwordWithChallenge = passwordWithChallengeElement.GetString();

                string token = _userService.VerifyCredentials(email, passwordWithChallenge);

                if (!string.IsNullOrEmpty(token))
                {
                    return Json(token);
                }
            }

            return BadRequest();
        }

        /*-------------------- RETURN VIEW API --------------------*/

        [HttpPost]
        [Route("/api/[controller]/returnUserInfo")]
        public IActionResult ReturnUserInfo([FromBody] JsonElement request)
        {
            if (request.TryGetProperty("email", out var emailElement))
            {
                string email = emailElement.GetString();
                try
                {
                    List<string> result = _userService.ReturnUserId(email);
                    return Json(result);//ritorno l'id dell'utente
                }
                catch (Exception e)
                {
                    return BadRequest($"{e.Message}");
                }
            }
            return BadRequest();
        }

        

        /*-------------------- VERIFY API --------------------*/


        [HttpGet]
        [Route("/api/[controller]/verifyToken")]
        public IActionResult VerifyToken([FromQuery] string token)
        {
            int result = _userService.VerifyToken(token);
            if (result > 0)
            {
                return Ok(result);
            }

            return Ok("");
        }
    }
}

