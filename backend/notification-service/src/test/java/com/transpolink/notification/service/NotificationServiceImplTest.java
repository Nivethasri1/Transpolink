package com.transpolink.notification.service;

import com.transpolink.notification.dto.NotificationRequest;
import com.transpolink.notification.dto.NotificationResponse;
import com.transpolink.notification.entity.Notification;
import com.transpolink.notification.enums.NotificationCategory;
import com.transpolink.notification.enums.NotificationStatus;
import com.transpolink.notification.exception.ResourceNotFoundException;
import com.transpolink.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock NotificationRepository notificationRepository;

    @InjectMocks NotificationServiceImpl notificationService;

    private Notification notification;

    @BeforeEach
    void setUp() {
        notification = Notification.builder()
                .notificationId(1L).userId(10L).entityId(5L)
                .message("Incident reported on Main St")
                .category(NotificationCategory.INCIDENT)
                .status(NotificationStatus.UNREAD)
                .createdDate(LocalDateTime.now()).build();
    }

    @Test
    void send_success() {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(10L); req.setEntityId(5L);
        req.setMessage("Incident reported on Main St");
        req.setCategory(NotificationCategory.INCIDENT);

        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationResponse response = notificationService.send(req);

        assertThat(response.getNotificationId()).isEqualTo(1L);
        assertThat(response.getMessage()).isEqualTo("Incident reported on Main St");
        assertThat(response.getStatus()).isEqualTo(NotificationStatus.UNREAD);
        assertThat(response.getCategory()).isEqualTo(NotificationCategory.INCIDENT);
    }

    @Test
    void getByUser_returnsList() {
        when(notificationRepository.findByUserId(10L)).thenReturn(List.of(notification));

        List<NotificationResponse> result = notificationService.getByUser(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(10L);
    }

    @Test
    void getByUser_returnsEmptyListWhenNoNotifications() {
        when(notificationRepository.findByUserId(99L)).thenReturn(List.of());

        List<NotificationResponse> result = notificationService.getByUser(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void getUnreadByUser_returnsOnlyUnread() {
        when(notificationRepository.findByUserIdAndStatus(10L, NotificationStatus.UNREAD))
                .thenReturn(List.of(notification));

        List<NotificationResponse> result = notificationService.getUnreadByUser(10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(NotificationStatus.UNREAD);
    }

    @Test
    void markAsRead_success() {
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        NotificationResponse response = notificationService.markAsRead(1L);

        verify(notificationRepository).save(notification);
        assertThat(response).isNotNull();
    }

    @Test
    void markAsRead_throwsWhenNotFound() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markAsRead(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
