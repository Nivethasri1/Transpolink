package com.transpolink.reporting.repository;

import com.transpolink.reporting.entity.Report;
import com.transpolink.reporting.enums.ReportScope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByScope(ReportScope scope);
}
