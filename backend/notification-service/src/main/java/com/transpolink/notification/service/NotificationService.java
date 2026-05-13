package com.transpolink.notification.service;

import com.transpolink.notification.dto.NotificationRequest;
import com.transpolink.notification.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse send(NotificationRequest request);
    List<NotificationResponse> getByUser(Long userId);
    List<NotificationResponse> getAllNotifications();
    List<NotificationResponse> getUnreadByUser(Long userId);
    NotificationResponse markAsRead(Long id);
}
