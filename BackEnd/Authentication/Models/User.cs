using System;
using System.Security.Cryptography;
using Authentication.UserToken;
using System.Text;
using Newtonsoft.Json;

namespace Authentication.UserModel
{
    public class User
    {
        private static int IdUserCounter = 0;
        public int Id { get; private set; }
        public string Name { get; private set; }
        public string Surname { get; private set; }

        public bool Status { get; private set; }
        public string Rool { get; private set; }

        public int LogCounter { get; private set; }

        [JsonProperty]
        private string _email;
        [JsonProperty]
        private string _password;
        [JsonProperty]
        private int _challenge;
        [JsonProperty]
        private Token _userToken;

        [JsonConstructor]
        public User(string name, string surname, string email, string password, bool status, string rool, int logCounter)
        {
            IdUserCounter++;
            Id = IdUserCounter;
            Name = name;
            Surname = surname;
            _email = email;
            _password = password;
            Status = status;
            Rool = rool;
            _userToken = new("", 0);
            LogCounter = logCounter;
        }


        public User(string name, string surname, string email, string password, bool status, string rool)
        {
            IdUserCounter++;
            Id = IdUserCounter;
            Name = name;
            Surname = surname;
            _email = email;
            _password = HashPassword(password);
            Status = status;
            Rool = rool;
            _userToken = new("", 0);
            LogCounter = 0;
        }

        /*----------------- AUTHENTICATION METHODS -----------------*/

        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
                byte[] hashedBytes = sha256.ComputeHash(passwordBytes);
                string hashedPassword = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();

                return hashedPassword;
            }
        }

        public int GenerateChallenge()
        {
            Random random = new Random();
            _challenge =  random.Next(100000, 999999);
            return _challenge;
        }

        public bool VerifyEmail(string email)
        {
            if(email == _email)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public string VerifyCredentials(string passwordWithChallenge)
        {
            if(passwordWithChallenge == $"{_password}{_challenge}" && Status)//HashPassword(_password+_challenge) is better, but the hash doesn't work the same in differents machines 
            {
                _userToken = GenerateToken();
                return _userToken.TokenCode;
            }
            else if (!Status)
            {
                return "";//account blocked
            }
            else
            {
                return "";//Password wrong
            }
        }

        private Token GenerateToken()
        {
            LogCounter++;
            return new Token(HashPassword($"{Id}{Name}{Surname}{_email}"), DateTimeOffset.UtcNow.ToUnixTimeMilliseconds());
        }

        public bool VerifyTokenExpiryDate(long time)
        {
            return _userToken.VerifyTokenExpiryDate(time);
        }

        public bool CompareToken(string token)
        {
            return _userToken.TokenCode == token;
        }
    }
}

