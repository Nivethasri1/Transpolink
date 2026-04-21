package com.transpolink.incident.seeder;

import com.transpolink.incident.entity.Incident;
import com.transpolink.incident.entity.Resolution;
import com.transpolink.incident.enums.IncidentStatus;
import com.transpolink.incident.enums.IncidentType;
import com.transpolink.incident.enums.ResolutionStatus;
import com.transpolink.incident.repository.IncidentRepository;
import com.transpolink.incident.repository.ResolutionRepository;
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

    private final IncidentRepository incidentRepository;
    private final ResolutionRepository resolutionRepository;

    @Override
    public void run(String... args) {
        if (incidentRepository.count() > 0) {
            log.info("Incident seeder skipped — data already exists.");
            return;
        }

        List<Incident> incidents = List.of(
            Incident.builder()
                .reporterId(2L).type(IncidentType.ACCIDENT)
                .location("Main Street & 5th Ave").date(LocalDateTime.now().minusHours(3))
                .status(IncidentStatus.REPORTED).build(),

            Incident.builder()
                .reporterId(6L).type(IncidentType.BREAKDOWN)
                .location("Highway 101 Northbound").date(LocalDateTime.now().minusHours(2))
                .status(IncidentStatus.IN_PROGRESS).build(),

            Incident.builder()
                .reporterId(2L).type(IncidentType.ROADBLOCK)
                .location("Downtown Bridge").date(LocalDateTime.now().minusHours(5))
                .status(IncidentStatus.RESOLVED).build(),

            Incident.builder()
                .reporterId(6L).type(IncidentType.ACCIDENT)
                .location("Elm Road Junction").date(LocalDateTime.now().minusDays(1))
                .status(IncidentStatus.CLOSED).build(),

            Incident.builder()
                .reporterId(2L).type(IncidentType.BREAKDOWN)
                .location("Industrial Zone Gate 3").date(LocalDateTime.now().minusMinutes(45))
                .status(IncidentStatus.REPORTED).build(),

            Incident.builder()
                .reporterId(6L).type(IncidentType.ROADBLOCK)
                .location("City Center Plaza").date(LocalDateTime.now().minusHours(1))
                .status(IncidentStatus.IN_PROGRESS).build()
        );

        List<Incident> saved = incidentRepository.saveAll(incidents);
        log.info("Seeded {} incidents.", saved.size());

        List<Resolution> resolutions = List.of(
            Resolution.builder()
                .incidentId(saved.get(1).getIncidentId()).officerId(3L)
                .actions("Dispatched tow truck and cleared lane.")
                .date(LocalDateTime.now().minusHours(1)).status(ResolutionStatus.PENDING).build(),

            Resolution.builder()
                .incidentId(saved.get(2).getIncidentId()).officerId(7L)
                .actions("Removed roadblock and restored traffic flow.")
                .date(LocalDateTime.now().minusHours(4)).status(ResolutionStatus.COMPLETED).build(),

            Resolution.builder()
                .incidentId(saved.get(3).getIncidentId()).officerId(3L)
                .actions("Accident cleared, report filed, road reopened.")
                .date(LocalDateTime.now().minusDays(1).plusHours(2)).status(ResolutionStatus.COMPLETED).build(),

            Resolution.builder()
                .incidentId(saved.get(5).getIncidentId()).officerId(7L)
                .actions("Traffic officers deployed to manage congestion.")
                .date(LocalDateTime.now().minusMinutes(30)).status(ResolutionStatus.PENDING).build()
        );

        resolutionRepository.saveAll(resolutions);
        log.info("Seeded {} resolutions.", resolutions.size());
    }
}
