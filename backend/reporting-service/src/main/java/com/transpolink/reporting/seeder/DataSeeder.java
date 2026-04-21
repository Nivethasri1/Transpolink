package com.transpolink.reporting.seeder;

import com.transpolink.reporting.entity.Report;
import com.transpolink.reporting.enums.ReportScope;
import com.transpolink.reporting.repository.ReportRepository;
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

    private final ReportRepository reportRepository;

    @Override
    public void run(String... args) {
        if (reportRepository.count() > 0) {
            log.info("Reporting seeder skipped — data already exists.");
            return;
        }

        List<Report> reports = List.of(
            Report.builder()
                .scope(ReportScope.INCIDENT)
                .metrics("{\"totalIncidents\":24,\"resolved\":18,\"inProgress\":4,\"reported\":2,\"avgResponseTimeHours\":1.8}")
                .generatedDate(LocalDateTime.now().minusDays(1)).build(),

            Report.builder()
                .scope(ReportScope.TRANSPORT)
                .metrics("{\"totalRoutes\":6,\"activeRoutes\":4,\"delayedSchedules\":2,\"cancelledSchedules\":1,\"onTimeRate\":\"78%\"}")
                .generatedDate(LocalDateTime.now().minusDays(2)).build(),

            Report.builder()
                .scope(ReportScope.TRAFFIC)
                .metrics("{\"totalSegments\":7,\"openSegments\":4,\"congestedSegments\":1,\"closedSegments\":1,\"underMaintenance\":1,\"avgSpeed\":42.5}")
                .generatedDate(LocalDateTime.now().minusDays(3)).build(),

            Report.builder()
                .scope(ReportScope.COMPLIANCE)
                .metrics("{\"totalRecords\":7,\"compliant\":4,\"nonCompliant\":2,\"underReview\":1,\"complianceRate\":\"57%\"}")
                .generatedDate(LocalDateTime.now().minusDays(4)).build(),

            Report.builder()
                .scope(ReportScope.INCIDENT)
                .metrics("{\"totalIncidents\":31,\"resolved\":25,\"inProgress\":3,\"reported\":3,\"avgResponseTimeHours\":2.1}")
                .generatedDate(LocalDateTime.now().minusDays(8)).build(),

            Report.builder()
                .scope(ReportScope.TRANSPORT)
                .metrics("{\"totalRoutes\":6,\"activeRoutes\":5,\"delayedSchedules\":1,\"cancelledSchedules\":0,\"onTimeRate\":\"91%\"}")
                .generatedDate(LocalDateTime.now().minusDays(9)).build(),

            Report.builder()
                .scope(ReportScope.TRAFFIC)
                .metrics("{\"totalSegments\":7,\"openSegments\":5,\"congestedSegments\":0,\"closedSegments\":1,\"underMaintenance\":1,\"avgSpeed\":58.3}")
                .generatedDate(LocalDateTime.now().minusDays(10)).build()
        );

        reportRepository.saveAll(reports);
        log.info("Seeded {} reports.", reports.size());
    }
}
