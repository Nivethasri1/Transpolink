package com.transpolink.notification.seeder;

import com.transpolink.notification.entity.Notification;
import com.transpolink.notification.enums.NotificationCategory;
import com.transpolink.notification.enums.NotificationStatus;
import com.transpolink.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final NotificationRepository notificationRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        if (notificationRepository.count() > 0) {
            log.info("Notification seeder skipped — data already exists.");
            return;
        }

        // Look up user IDs from identity DB by email
        Long adminId      = getUserId("admin@transpolink.com");
        Long citizenId    = getUserId("citizen@transpolink.com");
        Long officerId    = getUserId("officer@transpolink.com");
        Long transportId  = getUserId("transport@transpolink.com");
        Long complianceId = getUserId("compliance@transpolink.com");

        if (adminId == null || citizenId == null) {
            log.warn("Notification seeder skipped — required users not found in DB.");
            return;
        }

        List<Notification> notifications = new ArrayList<>();

        // Citizen notifications
        notifications.add(Notification.builder().userId(citizenId).message("Accident reported on Main Street & 5th Ave. Expect delays.").category(NotificationCategory.INCIDENT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusHours(3)).build());
        notifications.add(Notification.builder().userId(citizenId).message("Vehicle breakdown on Highway 101 Northbound. Officers dispatched.").category(NotificationCategory.INCIDENT).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusHours(2)).build());
        notifications.add(Notification.builder().userId(citizenId).message("Bus Route North District → City Center is running 20 minutes late.").category(NotificationCategory.TRANSPORT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusMinutes(44)).build());

        // Admin notifications
        notifications.add(Notification.builder().userId(adminId).message("Fleet Safety Inspection audit is currently IN_PROGRESS. Findings pending.").category(NotificationCategory.COMPLIANCE).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusDays(2)).build());
        notifications.add(Notification.builder().userId(adminId).message("Highway 101 breakdown cleared. Normal traffic flow resumed.").category(NotificationCategory.INCIDENT).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusMinutes(90)).build());

        // Traffic officer notifications
        if (officerId != null) {
            notifications.add(Notification.builder().userId(officerId).message("Roadblock at City Center Plaza. Traffic officers needed immediately.").category(NotificationCategory.INCIDENT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusMinutes(60)).build());
            notifications.add(Notification.builder().userId(officerId).message("Accident on Main Street has been resolved. Road is now clear.").category(NotificationCategory.INCIDENT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusHours(1)).build());
        }

        // Transport operator notifications
        if (transportId != null) {
            notifications.add(Notification.builder().userId(transportId).message("Schedule on Route North District → City Center is delayed by 20 minutes.").category(NotificationCategory.TRANSPORT).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusMinutes(45)).build());
            notifications.add(Notification.builder().userId(transportId).message("Route Central Station → Airport Terminal schedule confirmed for next departure.").category(NotificationCategory.TRANSPORT).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusHours(4)).build());
        }

        // Compliance officer notifications
        if (complianceId != null) {
            notifications.add(Notification.builder().userId(complianceId).message("Fleet Safety Inspection audit requires your review. Deadline approaching.").category(NotificationCategory.COMPLIANCE).status(NotificationStatus.UNREAD).createdDate(LocalDateTime.now().minusHours(5)).build());
            notifications.add(Notification.builder().userId(complianceId).message("Annual vehicle compliance check completed. Report available.").category(NotificationCategory.COMPLIANCE).status(NotificationStatus.READ).createdDate(LocalDateTime.now().minusDays(1)).build());
        }

        notificationRepository.saveAll(notifications);
        log.info("Seeded {} notifications.", notifications.size());
    }

    private Long getUserId(String email) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT user_id FROM transpolink_identity.users WHERE email = ?",
                Long.class, email
            );
        } catch (Exception e) {
            log.warn("User not found for email: {}", email);
            return null;
        }
    }
}
