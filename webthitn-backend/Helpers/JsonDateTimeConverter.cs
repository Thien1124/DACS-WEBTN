using System.Text.Json;
using System.Text.Json.Serialization;

namespace webthitn_backend.Helpers
{
    public class JsonDateTimeConverter : JsonConverter<DateTime>
    {
        public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            // Đọc DateTime từ JSON
            var dt = reader.GetDateTime();
            return dt;
        }

        public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
        {
            // Khi viết DateTime ra JSON, luôn chuyển sang múi giờ Việt Nam
            var vietnamTime = value.AddHours(7);
            writer.WriteStringValue(vietnamTime.ToString("yyyy-MM-ddTHH:mm:ss"));
        }
    }
}