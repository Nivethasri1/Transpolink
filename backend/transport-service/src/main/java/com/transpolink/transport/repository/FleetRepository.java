package com.transpolink.transport.repository;

import com.transpolink.transport.entity.Fleet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FleetRepository extends JpaRepository<Fleet, Long> {
    List<Fleet> findByOperatorId(Long operatorId);
}
