package com.transpolink.traffic.seeder;

import com.transpolink.traffic.entity.RoadSegment;
import com.transpolink.traffic.entity.TrafficFlow;
import com.transpolink.traffic.enums.FlowStatus;
import com.transpolink.traffic.enums.SegmentStatus;
import com.transpolink.traffic.repository.RoadSegmentRepository;
import com.transpolink.traffic.repository.TrafficFlowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoadSegmentRepository segmentRepository;
    private final TrafficFlowRepository flowRepository;

    @Override
    public void run(String... args) {
        if (segmentRepository.count() > 0) {
            log.info("Traffic seeder skipped — data already exists.");
            return;
        }

        List<RoadSegment> segments = List.of(
            RoadSegment.builder().location("Main Street Corridor").length(3.5).status(SegmentStatus.OPEN).build(),
            RoadSegment.builder().location("Highway 101 Northbound").length(12.0).status(SegmentStatus.OPEN).build(),
            RoadSegment.builder().location("Downtown Bridge").length(0.8).status(SegmentStatus.CONGESTED).build(),
            RoadSegment.builder().location("Industrial Zone Road").length(5.2).status(SegmentStatus.UNDER_MAINTENANCE).build(),
            RoadSegment.builder().location("Airport Expressway").length(8.4).status(SegmentStatus.OPEN).build(),
            RoadSegment.builder().location("Elm Road Junction").length(2.1).status(SegmentStatus.CLOSED).build(),
            RoadSegment.builder().location("City Center Ring Road").length(6.7).status(SegmentStatus.OPEN).build()
        );

        List<RoadSegment> saved = segmentRepository.saveAll(segments);
        log.info("Seeded {} road segments.", saved.size());

        List<TrafficFlow> flows = List.of(
            TrafficFlow.builder().segmentId(saved.get(0).getSegmentId()).volume(450).speed(55.0).date(LocalDateTime.now().minusMinutes(10)).status(FlowStatus.NORMAL).build(),
            TrafficFlow.builder().segmentId(saved.get(0).getSegmentId()).volume(620).speed(35.0).date(LocalDateTime.now().minusMinutes(5)).status(FlowStatus.SLOW).build(),
            TrafficFlow.builder().segmentId(saved.get(1).getSegmentId()).volume(800).speed(70.0).date(LocalDateTime.now().minusMinutes(15)).status(FlowStatus.NORMAL).build(),
            TrafficFlow.builder().segmentId(saved.get(2).getSegmentId()).volume(1200).speed(12.0).date(LocalDateTime.now().minusMinutes(8)).status(FlowStatus.HEAVY).build(),
            TrafficFlow.builder().segmentId(saved.get(2).getSegmentId()).volume(1500).speed(5.0).date(LocalDateTime.now().minusMinutes(3)).status(FlowStatus.STANDSTILL).build(),
            TrafficFlow.builder().segmentId(saved.get(4).getSegmentId()).volume(300).speed(90.0).date(LocalDateTime.now().minusMinutes(20)).status(FlowStatus.NORMAL).build(),
            TrafficFlow.builder().segmentId(saved.get(6).getSegmentId()).volume(700).speed(28.0).date(LocalDateTime.now().minusMinutes(6)).status(FlowStatus.SLOW).build(),
            TrafficFlow.builder().segmentId(saved.get(6).getSegmentId()).volume(950).speed(18.0).date(LocalDateTime.now().minusMinutes(2)).status(FlowStatus.HEAVY).build()
        );

        flowRepository.saveAll(flows);
        log.info("Seeded {} traffic flow records.", flows.size());
    }
}
