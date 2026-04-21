package com.transpolink.notification.dto;

import com.transpolink.notification.enums.NotificationCategory;
import com.transpolink.notification.enums.NotificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class NotificationResponse {
    private Long notificationId;
    private Long userId;
    private Long entityId;
    private String message;
    private NotificationCategory category;
    private NotificationStatus status;
    private LocalDateTime createdDate;
}
