package com.transpolink.incident.repository;

import com.transpolink.incident.entity.Incident;
import com.transpolink.incident.enums.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findByReporterId(Long reporterId);
}
