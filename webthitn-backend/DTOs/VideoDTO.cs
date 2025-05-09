using System;

namespace webthitn_backend.DTOs
{
    /// <summary>
    /// DTO hiển thị thông tin video
    /// </summary>
    public class VideoDTO
    {
        /// <summary>
        /// ID của video
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Tiêu đề video
        /// </summary>
        public string Title { get; set; }

        /// <summary>
        /// Mô tả video
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Đường dẫn tới file video
        /// </summary>
        public string Url { get; set; }

        /// <summary>
        /// Đường dẫn tới thumbnail của video
        /// </summary>
        public string ThumbnailUrl { get; set; }

        /// <summary>
        /// Thời lượng video (giây)
        /// </summary>
        public int Duration { get; set; }

        /// <summary>
        /// Định dạng thời lượng dạng hh:mm:ss
        /// </summary>
        public string FormattedDuration => TimeSpan.FromSeconds(Duration).ToString(@"hh\:mm\:ss");

        /// <summary>
        /// Kích thước file (bytes)
        /// </summary>
        public long FileSize { get; set; }

        /// <summary>
        /// Kích thước file định dạng chuỗi (KB, MB, GB)
        /// </summary>
        public string FormattedFileSize => FormatFileSize(FileSize);

        /// <summary>
        /// Loại file (mp4, avi, etc.)
        /// </summary>
        public string FileType { get; set; }

        /// <summary>
        /// ID của môn học
        /// </summary>
        public int SubjectId { get; set; }

        /// <summary>
        /// Tên môn học
        /// </summary>
        public string SubjectName { get; set; }

        /// <summary>
        /// ID của chương học (nếu có)
        /// </summary>
        public int? ChapterId { get; set; }

        /// <summary>
        /// Tên chương học (nếu có)
        /// </summary>
        public string ChapterName { get; set; }

        /// <summary>
        /// Các tag/từ khóa liên quan đến video
        /// </summary>
        public string Tags { get; set; }

        /// <summary>
        /// Số lượt xem
        /// </summary>
        public int ViewCount { get; set; }

        /// <summary>
        /// Thời gian tạo
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Helper method để định dạng kích thước file
        /// </summary>
        private string FormatFileSize(long bytes)
        {
            string[] suffixes = { "B", "KB", "MB", "GB", "TB", "PB" };
            int counter = 0;
            decimal number = bytes;

            while (Math.Round(number / 1024) >= 1)
            {
                number = number / 1024;
                counter++;
            }

            return $"{number:n1} {suffixes[counter]}";
        }
    }
}