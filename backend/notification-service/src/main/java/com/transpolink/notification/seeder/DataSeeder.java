package com.transpolink.notification.seeder;

import com.transpolink.notification.entity.Notification;
import com.transpolink.notification.enums.NotificationCategory;
import com.transpolink.notification.enums.NotificationStatus;
import com.transpolink.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final NotificationRepository notificationRepository;

    @Override
    public void run(String... args) {
        if (notificationRepository.count() > 0) {
            log.info("Notification seeder skipped — data already exists.");
            return;
        }

        List<Notification> notifications = List.of(
            Notification.builder().userId(2L).entityId(1L).message("Accident reported on Main Street & 5th Ave. Expect delays.").category(NotificationCategory.INCIDENT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusHours(3)).build(),
            Notification.builder().userId(2L).entityId(2L).message("Vehicle breakdown on Highway 101 Northbound. Officers dispatched.").category(NotificationCategory.INCIDENT).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusHours(2)).build(),
            Notification.builder().userId(6L).entityId(1L).message("Accident on Main Street has been resolved. Road is now clear.").category(NotificationCategory.INCIDENT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusHours(1)).build(),
            Notification.builder().userId(4L).entityId(4L).message("Schedule on Route North District → City Center is delayed by 20 minutes.").category(NotificationCategory.TRANSPORT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusMinutes(45)).build(),
            Notification.builder().userId(2L).entityId(4L).message("Bus Route North District → City Center is running 20 minutes late.").category(NotificationCategory.TRANSPORT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusMinutes(44)).build(),
            Notification.builder().userId(6L).entityId(7L).message("Schedule on Route University Campus → Shopping Mall has been cancelled.").category(NotificationCategory.TRANSPORT).status(NotificationStatus.DISMISSED).createdDate(LocalDateTime.now().minusMinutes(30)).build(),
            Notification.builder().userId(5L).entityId(3L).message("Compliance record for Entity #3 flagged as NON_COMPLIANT. Review required.").category(NotificationCategory.COMPLIANCE).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusDays(3)).build(),
            Notification.builder().userId(5L).entityId(6L).message("Driver license compliance violation detected for Entity #6. Immediate action needed.").category(NotificationCategory.COMPLIANCE).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusDays(4)).build(),
            Notification.builder().userId(1L).entityId(4L).message("Fleet Safety Inspection audit is currently IN_PROGRESS. Findings pending.").category(NotificationCategory.COMPLIANCE).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusDays(2)).build(),
            Notification.builder().userId(3L).entityId(5L).message("Roadblock at City Center Plaza. Traffic officers needed immediately.").category(NotificationCategory.INCIDENT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusMinutes(60)).build(),
            Notification.builder().userId(1L).entityId(2L).message("Highway 101 breakdown cleared. Normal traffic flow resumed.").category(NotificationCategory.INCIDENT).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusMinutes(90)).build(),
            Notification.builder().userId(4L).entityId(1L).message("Route Central Station → Airport Terminal schedule confirmed for next departure.").category(NotificationCategory.TRANSPORT).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusHours(4)).build()
        );

        notificationRepository.saveAll(notifications);
        log.info("Seeded {} notifications.", notifications.size());
    }
}
