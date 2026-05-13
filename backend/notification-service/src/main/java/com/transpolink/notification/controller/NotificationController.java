package com.transpolink.notification.controller;

import com.transpolink.notification.dto.NotificationRequest;
import com.transpolink.notification.dto.NotificationResponse;
import com.transpolink.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/api/notifications")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('GOVERNMENT_OFFICER') or hasRole('TRANSPORT_COMPANY') or hasRole('CITIZEN') or hasRole('COMPLIANCE_OFFICER') or hasRole('TRANSPORT_OPERATOR')")
    public ResponseEntity<List<NotificationResponse>> getAll() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PostMapping("/api/notifications")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('COMPLIANCE_OFFICER') or hasRole('TRANSPORT_OPERATOR')")
    public ResponseEntity<NotificationResponse> send(@Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.send(request));
    }

    @GetMapping("/api/notifications/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('COMPLIANCE_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('CITIZEN')")
    public ResponseEntity<List<NotificationResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getByUser(userId));
    }

    @GetMapping("/api/notifications/user/{userId}/unread")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('COMPLIANCE_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('CITIZEN')")
    public ResponseEntity<List<NotificationResponse>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadByUser(userId));
    }

    @PatchMapping("/api/notifications/{id}/read")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAFFIC_OFFICER') or hasRole('COMPLIANCE_OFFICER') or hasRole('TRANSPORT_OPERATOR') or hasRole('CITIZEN')")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }
}
