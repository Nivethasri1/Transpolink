package com.transpolink.notification.service;

import com.transpolink.notification.dto.NotificationRequest;
import com.transpolink.notification.dto.NotificationResponse;
import com.transpolink.notification.entity.Notification;
import com.transpolink.notification.enums.NotificationStatus;
import com.transpolink.notification.exception.ResourceNotFoundException;
import com.transpolink.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationResponse send(NotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId()).entityId(request.getEntityId())
                .message(request.getMessage()).category(request.getCategory()).build();
        return mapToResponse(notificationRepository.save(notification));
    }

    @Override
    public List<NotificationResponse> getByUser(Long userId) {
        return notificationRepository.findByUserId(userId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<NotificationResponse> getUnreadByUser(Long userId) {
        return notificationRepository.findByUserIdAndStatus(userId, NotificationStatus.UNREAD)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        notification.setStatus(NotificationStatus.READ);
        return mapToResponse(notificationRepository.save(notification));
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .notificationId(n.getNotificationId()).userId(n.getUserId())
                .entityId(n.getEntityId()).message(n.getMessage())
                .category(n.getCategory()).status(n.getStatus()).createdDate(n.getCreatedDate()).build();
    }
}
