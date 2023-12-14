using System;
using System.Net;
using System.Net.Mail;
using Authentication.UserModel;
using filemanager;

namespace Authentication.UserServiceModels
{
    public class UserService
    {
        private List<User> _userList = new();
        private FileManager fileManager;

        public UserService()
        {
            fileManager = FileManager.Instance;
            _userList = fileManager.DeserializeFromJsonFile<List<User>>("../FileManager/AuthFilesJson/UserList.json");
        }

        /*-------------------- AUTH METODS --------------------*/

        private void SendPassword(string email, string password)
        {
            string senderPsw = "AuthServ";

            SmtpClient client = new("smtp-mail.outlook.com", 587)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential("authenticationService81@outlook.com", senderPsw)
            };

            client.Send(new MailMessage("authenticationService81@outlook.com", email, "Your registration is successfully compleated!", $"Here is your password : {password}"));
        }

        private string GeneratePassword()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz";

            Random random = new Random();
            char[] password = new char[8];

            for (int i = 0; i < 8; i++)
            {
                int randomIndex = random.Next(chars.Length);
                password[i] = chars[randomIndex];
            }

            return new string(password);
        }

        public bool AddNewUser(string name, string surname, string email, string rool)
        {
            bool notRegistered = true;
            for(int i = 0; i < _userList.Count; i++)
            {
                if (_userList[i].VerifyEmail(email))
                {
                    notRegistered = false;
                }
            }

            if (notRegistered)
            {
                try
                {
                    string NewPassword = GeneratePassword();
                    SendPassword(email, NewPassword);
                    User NewUser = new User(name, surname, email, NewPassword, true, rool);//the hash of the password will be done when we will pass like parameter the generated function to the contructor of the class User
                    _userList.Add(NewUser);
                    fileManager.SerializeToJsonFile(_userList, "../FileManager/AuthFilesJson/UserList.json");
                    return true;
                }
                catch
                {
                    return false;
                }
            }
            else
            {
                return false;
            }
        }

        public int GenerateChallenge(string email)
        {
            for (int i = 0; i < _userList.Count; i++)
            {
                if (_userList[i].VerifyEmail(email))
                {
                    return _userList[i].GenerateChallenge();
                }
            }

            return 0;
        }

        public string VerifyCredentials(string email, string passwordWithChallenge)
        {
            for (int i = 0; i < _userList.Count; i++)
            {
                if (_userList[i].VerifyEmail(email))
                {
                    string result = _userList[i].VerifyCredentials(passwordWithChallenge);

                    if(result != "")
                    {
                        fileManager.SerializeToJsonFile(_userList, "../FileManager/AuthFilesJson/UserList.json");
                        return result;
                    }
                }
            }

            return "";//Email not found

        }

        public List<string> ReturnUserId(string email)
        {
            for(int i = 0; i < _userList.Count; i++)
            {
                if(_userList[i].VerifyEmail(email))
                {

                    return new List<string>(){$"{_userList[i].Id}", _userList[i].Name, _userList[i].Surname};
                }
            }

            throw new Exception("user not found");
        }

        /*-------------------- VERIFY METOD --------------------*/

        public int VerifyToken(string token)
        {
            for (int i = 0; i < _userList.Count; i++)
            {
                if (_userList[i].CompareToken(token)
                    && _userList[i].VerifyTokenExpiryDate(DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()))
                {
                    return _userList[i].Id;
                }
            }
            return 0;

        }
    }
}



