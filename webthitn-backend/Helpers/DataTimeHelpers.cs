using System;

namespace WEBTHITN_Backend.Helpers
{
    public static class DateTimeHelper
    {
        // Offset múi giờ Việt Nam so với UTC: +7 giờ
        private static readonly TimeSpan VietnamOffset = TimeSpan.FromHours(7);

        /// <summary>
        /// Chuyển đổi UTC DateTime sang múi giờ Việt Nam
        /// </summary>
        public static DateTime ToVietnamTime(this DateTime utcDateTime)
        {
            if (utcDateTime.Kind == DateTimeKind.Unspecified)
                utcDateTime = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);

            return utcDateTime.Add(VietnamOffset);
        }

        /// <summary>
        /// Chuyển đổi múi giờ Việt Nam sang UTC
        /// </summary>
        public static DateTime ToUtcFromVietnam(this DateTime vietnamDateTime)
        {
            if (vietnamDateTime.Kind == DateTimeKind.Utc)
                return vietnamDateTime;

            return vietnamDateTime.Subtract(VietnamOffset);
        }

        /// <summary>
        /// Lấy thời gian hiện tại theo múi giờ Việt Nam
        /// </summary>
        public static DateTime GetVietnamNow()
        {
            return DateTime.UtcNow.Add(VietnamOffset);
        }
    }
}