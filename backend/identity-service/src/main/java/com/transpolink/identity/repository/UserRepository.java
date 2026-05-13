package com.transpolink.identity.repository;

import com.transpolink.identity.entity.User;
import com.transpolink.identity.enums.Role;
import com.transpolink.identity.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByStatus(UserStatus status);
    List<User> findByRoleAndStatus(Role role, UserStatus status);
}
