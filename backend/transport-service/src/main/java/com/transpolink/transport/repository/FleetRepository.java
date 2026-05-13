package com.transpolink.transport.repository;

import com.transpolink.transport.entity.Fleet;
import com.transpolink.transport.enums.FleetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FleetRepository extends JpaRepository<Fleet, Long> {
    List<Fleet> findByStatus(FleetStatus status);
    List<Fleet> findByStatusAndVehicleType(FleetStatus status, String vehicleType);
}
