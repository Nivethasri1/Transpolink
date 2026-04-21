package com.transpolink.compliance.repository;

import com.transpolink.compliance.entity.Audit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditRepository extends JpaRepository<Audit, Long> {
    List<Audit> findByOfficerId(Long officerId);
}
