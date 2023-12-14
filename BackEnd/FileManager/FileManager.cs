using Newtonsoft.Json;

namespace filemanager
{
    public class FileManager
    {
        private static FileManager? _instance = null;
        private static readonly object _lockObject = new();

        private FileManager() { }

        public static FileManager Instance
        {
            get
            {
                lock (_lockObject)
                {
                    return _instance ??= new FileManager();
                }
            }
        }

        

        public void SerializeToJsonFile<T>(T obj, string filePath)
        {
            string jsonString = JsonConvert.SerializeObject(obj, Formatting.None,
                new JsonSerializerSettings
                {
                    TypeNameHandling = TypeNameHandling.All
                }
            );
            File.WriteAllText(filePath, jsonString);
        }

        public T DeserializeFromJsonFile<T>(string filePath)
        {
            if (File.Exists(filePath))
            {
                string jsonString = File.ReadAllText(filePath);
                if (!string.IsNullOrEmpty(jsonString))
                {
                    return JsonConvert.DeserializeObject<T>(jsonString,
                           new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.Auto }
                        );
                }
            }

            return default(T);
        }
    }
}

