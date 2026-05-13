package com.transpolink.identity.config;

import com.transpolink.identity.entity.User;
import com.transpolink.identity.enums.Role;
import com.transpolink.identity.enums.UserStatus;
import com.transpolink.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@transpolink.com")) return;

        userRepository.save(User.builder()
                .name("Super Admin")
                .email("admin@transpolink.com")
                .phone("0000000000")
                .password(passwordEncoder.encode("Admin@1234"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        System.out.println(">>> Default admin seeded: admin@transpolink.com / Admin@1234");
    }
}
