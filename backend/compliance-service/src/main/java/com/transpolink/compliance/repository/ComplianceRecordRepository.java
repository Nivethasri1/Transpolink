package com.transpolink.compliance.repository;

import com.transpolink.compliance.entity.ComplianceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplianceRecordRepository extends JpaRepository<ComplianceRecord, Long> {
    List<ComplianceRecord> findByEntityId(Long entityId);
}
