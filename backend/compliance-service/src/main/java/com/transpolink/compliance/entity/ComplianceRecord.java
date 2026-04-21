package com.transpolink.compliance.entity;

import com.transpolink.compliance.enums.ComplianceResult;
import com.transpolink.compliance.enums.ComplianceType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "compliance_records")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ComplianceRecord {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complianceId;

    private Long entityId;

    @Enumerated(EnumType.STRING)
    private ComplianceType type;

    @Enumerated(EnumType.STRING)
    private ComplianceResult result;

    @Builder.Default
    private LocalDate date = LocalDate.now();

    private String notes;
}
