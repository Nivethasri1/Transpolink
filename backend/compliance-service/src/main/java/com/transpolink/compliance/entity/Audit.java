package com.transpolink.compliance.entity;

import com.transpolink.compliance.enums.AuditStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "audits")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Audit {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditId;

    private Long officerId;
    private String scope;
    private String findings;

    @Builder.Default
    private LocalDate date = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AuditStatus status = AuditStatus.PLANNED;
}
