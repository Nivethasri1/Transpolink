package com.transpolink.reporting.entity;

import com.transpolink.reporting.enums.ReportScope;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Report {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    @Enumerated(EnumType.STRING)
    private ReportScope scope;

    @Column(columnDefinition = "TEXT")
    private String metrics;

    @Builder.Default
    private LocalDateTime generatedDate = LocalDateTime.now();
}
