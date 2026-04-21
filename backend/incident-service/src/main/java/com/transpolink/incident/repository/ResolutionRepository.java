package com.transpolink.incident.repository;

import com.transpolink.incident.entity.Resolution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResolutionRepository extends JpaRepository<Resolution, Long> {
    List<Resolution> findByIncidentId(Long incidentId);
}
