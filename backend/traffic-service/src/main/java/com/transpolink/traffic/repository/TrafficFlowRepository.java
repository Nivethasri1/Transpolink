package com.transpolink.traffic.repository;

import com.transpolink.traffic.entity.TrafficFlow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrafficFlowRepository extends JpaRepository<TrafficFlow, Long> {
    List<TrafficFlow> findBySegmentId(Long segmentId);
}
