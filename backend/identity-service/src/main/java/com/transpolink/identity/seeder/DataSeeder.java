package com.transpolink.identity.seeder;

import com.transpolink.identity.entity.AuditLog;
import com.transpolink.identity.entity.User;
import com.transpolink.identity.enums.Role;
import com.transpolink.identity.enums.UserStatus;
import com.transpolink.identity.repository.AuditLogRepository;
import com.transpolink.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@transpolink.com")) {
            log.info("Identity seeder skipped — data already exists.");
            return;
        }

        List<User> users = List.of(
            User.builder()
                .name("Admin User").role(Role.ADMIN)
                .email("admin@transpolink.com").phone("1000000001")
                .password(passwordEncoder.encode("Admin@123"))
                .status(UserStatus.ACTIVE).build(),

            User.builder()
                .name("Bob Citizen").role(Role.CITIZEN)
                .email("citizen@transpolink.com").phone("1000000002")
                .password(passwordEncoder.encode("Citizen@123"))
                .status(UserStatus.ACTIVE).build(),

            User.builder()
                .name("Carol Officer").role(Role.TRAFFIC_OFFICER)
                .email("officer@transpolink.com").phone("1000000003")
                .password(passwordEncoder.encode("Officer@123"))
                .status(UserStatus.ACTIVE).build(),

            User.builder()
                .name("Dave Transport").role(Role.TRANSPORT_OPERATOR)
                .email("transport@transpolink.com").phone("1000000004")
                .password(passwordEncoder.encode("Transport@123"))
                .status(UserStatus.ACTIVE).build(),

            User.builder()
                .name("Eve Compliance").role(Role.COMPLIANCE_OFFICER)
                .email("compliance@transpolink.com").phone("1000000005")
                .password(passwordEncoder.encode("Compliance@123"))
                .status(UserStatus.ACTIVE).build(),

            User.builder()
                .name("Frank Pending").role(Role.TRAFFIC_OFFICER)
                .email("frank@transpolink.com").phone("1000000006")
                .password(passwordEncoder.encode("Frank@123"))
                .status(UserStatus.PENDING).build(),

            User.builder()
                .name("Grace Pending").role(Role.TRANSPORT_OPERATOR)
                .email("grace@transpolink.com").phone("1000000007")
                .password(passwordEncoder.encode("Grace@123"))
                .status(UserStatus.PENDING).build(),

            User.builder()
                .name("Henry Rejected").role(Role.COMPLIANCE_OFFICER)
                .email("henry@transpolink.com").phone("1000000008")
                .password(passwordEncoder.encode("Henry@123"))
                .status(UserStatus.REJECTED).build()
        );

        List<User> saved = userRepository.saveAll(users);
        log.info("Seeded {} users.", saved.size());

        List<AuditLog> logs = List.of(
            AuditLog.builder().userId(saved.get(0).getUserId()).action("REGISTER").resource("User").timestamp(LocalDateTime.now()).build(),
            AuditLog.builder().userId(saved.get(1).getUserId()).action("REGISTER").resource("User").timestamp(LocalDateTime.now()).build(),
            AuditLog.builder().userId(saved.get(2).getUserId()).action("REGISTER").resource("User").timestamp(LocalDateTime.now()).build()
        );
        auditLogRepository.saveAll(logs);
        log.info("Seeded {} audit logs.", logs.size());
    }
}
