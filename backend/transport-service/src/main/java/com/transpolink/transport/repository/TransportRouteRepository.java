package com.transpolink.transport.repository;

import com.transpolink.transport.entity.TransportRoute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransportRouteRepository extends JpaRepository<TransportRoute, Long> {
    List<TransportRoute> findByOperatorId(Long operatorId);
}
