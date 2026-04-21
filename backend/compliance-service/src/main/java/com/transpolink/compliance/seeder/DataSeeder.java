package com.transpolink.compliance.seeder;

import com.transpolink.compliance.entity.Audit;
import com.transpolink.compliance.entity.ComplianceRecord;
import com.transpolink.compliance.enums.AuditStatus;
import com.transpolink.compliance.enums.ComplianceResult;
import com.transpolink.compliance.enums.ComplianceType;
import com.transpolink.compliance.repository.AuditRepository;
import com.transpolink.compliance.repository.ComplianceRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("dev")
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final ComplianceRecordRepository recordRepository;
    private final AuditRepository auditRepository;

    @Override
    public void run(String... args) {
        if (recordRepository.count() > 0) {
            log.info("Compliance seeder skipped — data already exists.");
            return;
        }

        List<ComplianceRecord> records = List.of(
            ComplianceRecord.builder().entityId(1L).type(ComplianceType.INCIDENT).result(ComplianceResult.COMPLIANT).date(LocalDate.now().minusDays(1)).notes("Incident resolved within SLA.").build(),
            ComplianceRecord.builder().entityId(2L).type(ComplianceType.TRANSPORT).result(ComplianceResult.COMPLIANT).date(LocalDate.now().minusDays(2)).notes("Route schedule adhered to policy.").build(),
            ComplianceRecord.builder().entityId(3L).type(ComplianceType.INCIDENT).result(ComplianceResult.NON_COMPLIANT).date(LocalDate.now().minusDays(3)).notes("Response time exceeded 2-hour threshold.").build(),
            ComplianceRecord.builder().entityId(4L).type(ComplianceType.TRANSPORT).result(ComplianceResult.UNDER_REVIEW).date(LocalDate.now()).notes("Fleet maintenance records under review.").build(),
            ComplianceRecord.builder().entityId(5L).type(ComplianceType.INCIDENT).result(ComplianceResult.COMPLIANT).date(LocalDate.now().minusDays(5)).notes("All procedures followed correctly.").build(),
            ComplianceRecord.builder().entityId(6L).type(ComplianceType.TRANSPORT).result(ComplianceResult.NON_COMPLIANT).date(LocalDate.now().minusDays(4)).notes("Driver license expired — flagged for action.").build(),
            ComplianceRecord.builder().entityId(1L).type(ComplianceType.TRANSPORT).result(ComplianceResult.COMPLIANT).date(LocalDate.now().minusDays(7)).notes("Vehicle inspection passed.").build()
        );

        recordRepository.saveAll(records);
        log.info("Seeded {} compliance records.", records.size());

        List<Audit> audits = List.of(
            Audit.builder().officerId(5L).scope("Transport Route Compliance Q1").findings("3 routes found non-compliant with schedule policy.").date(LocalDate.now().minusDays(10)).status(AuditStatus.COMPLETED).build(),
            Audit.builder().officerId(5L).scope("Incident Response Time Audit").findings("Average response time: 1.8 hours. 2 incidents exceeded threshold.").date(LocalDate.now().minusDays(5)).status(AuditStatus.COMPLETED).build(),
            Audit.builder().officerId(5L).scope("Fleet Safety Inspection Q2").findings("Pending inspection of 4 vehicles.").date(LocalDate.now().minusDays(2)).status(AuditStatus.IN_PROGRESS).build(),
            Audit.builder().officerId(5L).scope("Driver Licensing Compliance").findings(null).date(LocalDate.now().plusDays(3)).status(AuditStatus.PLANNED).build(),
            Audit.builder().officerId(5L).scope("Road Maintenance Policy Audit").findings("All segments comply with maintenance schedule.").date(LocalDate.now().minusDays(15)).status(AuditStatus.COMPLETED).build()
        );

        auditRepository.saveAll(audits);
        log.info("Seeded {} audits.", audits.size());
    }
}
