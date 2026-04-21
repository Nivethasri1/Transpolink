package com.transpolink.reporting.service;

import com.transpolink.reporting.dto.ReportRequest;
import com.transpolink.reporting.dto.ReportResponse;
import com.transpolink.reporting.entity.Report;
import com.transpolink.reporting.enums.ReportScope;
import com.transpolink.reporting.exception.ResourceNotFoundException;
import com.transpolink.reporting.repository.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportingServiceImplTest {

    @Mock ReportRepository reportRepository;

    @InjectMocks ReportingServiceImpl reportingService;

    private Report report;

    @BeforeEach
    void setUp() {
        report = Report.builder()
                .reportId(1L).scope(ReportScope.INCIDENT)
                .metrics("{\"total\":10}").generatedDate(LocalDateTime.now()).build();
    }

    @Test
    void generateReport_success() {
        ReportRequest req = new ReportRequest();
        req.setScope(ReportScope.INCIDENT); req.setMetrics("{\"total\":10}");

        when(reportRepository.save(any(Report.class))).thenReturn(report);

        ReportResponse response = reportingService.generateReport(req);

        assertThat(response.getReportId()).isEqualTo(1L);
        assertThat(response.getScope()).isEqualTo(ReportScope.INCIDENT);
        assertThat(response.getMetrics()).isEqualTo("{\"total\":10}");
    }

    @Test
    void getReportById_success() {
        when(reportRepository.findById(1L)).thenReturn(Optional.of(report));

        ReportResponse response = reportingService.getReportById(1L);

        assertThat(response.getReportId()).isEqualTo(1L);
        assertThat(response.getGeneratedDate()).isNotNull();
    }

    @Test
    void getReportById_throwsWhenNotFound() {
        when(reportRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportingService.getReportById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getAllReports_returnsList() {
        when(reportRepository.findAll()).thenReturn(List.of(report));

        List<ReportResponse> result = reportingService.getAllReports();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getScope()).isEqualTo(ReportScope.INCIDENT);
    }

    @Test
    void getReportsByScope_returnsList() {
        when(reportRepository.findByScope(ReportScope.INCIDENT)).thenReturn(List.of(report));

        List<ReportResponse> result = reportingService.getReportsByScope("INCIDENT");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getReportId()).isEqualTo(1L);
    }

    @Test
    void getReportsByScope_throwsOnInvalidScope() {
        assertThatThrownBy(() -> reportingService.getReportsByScope("INVALID_SCOPE"))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
