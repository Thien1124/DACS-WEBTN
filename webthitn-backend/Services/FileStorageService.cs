using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;

namespace webthitn_backend.Services
{
    public interface IFileStorageService
    {
        Task<(string videoUrl, string thumbnailUrl, int duration)> SaveVideoAsync(
            Stream fileStream, string fileName, string fileExtension);
    }

    public class FileStorageService : IFileStorageService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<FileStorageService> _logger;
        private readonly string _basePath;
        private readonly string _baseUrl;

        public FileStorageService(IConfiguration configuration, ILogger<FileStorageService> logger)
        {
            _configuration = configuration;
            _logger = logger;
            _basePath = _configuration["FileStorage:BasePath"];
            _baseUrl = _configuration["FileStorage:BaseUrl"];
        }

        public async Task<(string videoUrl, string thumbnailUrl, int duration)> SaveVideoAsync(
            Stream fileStream, string fileName, string fileExtension)
        {
            // Tạo thư mục lưu trữ nếu chưa tồn tại
            var videoDirectory = Path.Combine(_basePath, "videos");
            var thumbnailDirectory = Path.Combine(_basePath, "thumbnails");
            Directory.CreateDirectory(videoDirectory);
            Directory.CreateDirectory(thumbnailDirectory);

            // Đường dẫn đầy đủ đến file
            var videoPath = Path.Combine(videoDirectory, fileName);
            var thumbnailPath = Path.Combine(thumbnailDirectory, Path.GetFileNameWithoutExtension(fileName) + ".jpg");

            // Lưu file video
            using (var fileStream2 = new FileStream(videoPath, FileMode.Create))
            {
                await fileStream.CopyToAsync(fileStream2);
            }

            // Tạo thumbnail từ video sử dụng FFmpeg
            int duration = 0;
            try
            {
                duration = await GenerateThumbnailAsync(videoPath, thumbnailPath);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Lỗi khi tạo thumbnail: {ex.Message}");
                // Nếu không tạo được thumbnail, sử dụng thumbnail mặc định
                var defaultThumbnailPath = Path.Combine(_basePath, "defaults", "video-thumbnail.jpg");
                if (File.Exists(defaultThumbnailPath))
                {
                    File.Copy(defaultThumbnailPath, thumbnailPath, true);
                }
            }

            // Trả về URL public để truy cập file và thumbnail
            string videoUrl = $"{_baseUrl}/videos/{fileName}";
            string thumbnailUrl = $"{_baseUrl}/thumbnails/{Path.GetFileNameWithoutExtension(fileName)}.jpg";

            return (videoUrl, thumbnailUrl, duration);
        }

        private async Task<int> GenerateThumbnailAsync(string videoPath, string thumbnailPath)
        {
            // Sử dụng FFmpeg để tạo thumbnail và lấy thời lượng video
            var processInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg", // Đảm bảo ffmpeg đã được cài đặt trên server
                Arguments = $"-i \"{videoPath}\" -ss 00:00:03 -vframes 1 \"{thumbnailPath}\" -hide_banner",
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            int duration = 0;
            using (var process = Process.Start(processInfo))
            {
                var output = await process.StandardError.ReadToEndAsync();
                await process.WaitForExitAsync();

                // Phân tích output để lấy duration
                if (output.Contains("Duration:"))
                {
                    var durationStr = output.Split("Duration:")[1].Split(",")[0].Trim();
                    var timeParts = durationStr.Split(':');
                    if (timeParts.Length >= 3)
                    {
                        int hours = int.Parse(timeParts[0]);
                        int minutes = int.Parse(timeParts[1]);
                        int seconds = (int)float.Parse(timeParts[2].Replace(".", ","));
                        duration = hours * 3600 + minutes * 60 + seconds;
                    }
                }
            }

            return duration;
        }
    }
}