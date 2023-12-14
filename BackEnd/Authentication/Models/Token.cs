using System;
using System.Text.Json;

// TODO: refactor namespaces
namespace Authentication.UserToken
{
	public class Token
	{
		public string TokenCode { get; private set; }
		public long ExpiryDate { get; private set; }

        public Token(string tokenCode, long expiryDate)
		{
            TokenCode = tokenCode;
            ExpiryDate = expiryDate + 6000000;//mettere una buona data di expire
		}

		public bool VerifyTokenExpiryDate(long time)
		{
			if(time < ExpiryDate)
			{
				return true;
			}
			else
			{
				return false;
			}
		}

        public override string ToString()
        {
			return $"{TokenCode} {ExpiryDate}";
        }
    }
}

