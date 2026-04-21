package com.transpolink.reporting.service;

import com.transpolink.reporting.dto.ReportRequest;
import com.transpolink.reporting.dto.ReportResponse;
import com.transpolink.reporting.entity.Report;
import com.transpolink.reporting.enums.ReportScope;
import com.transpolink.reporting.exception.ResourceNotFoundException;
import com.transpolink.reporting.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingServiceImpl implements ReportingService {

    private final ReportRepository reportRepository;

    @Override
    public ReportResponse generateReport(ReportRequest request) {
        Report report = Report.builder().scope(request.getScope()).metrics(request.getMetrics()).build();
        return mapToResponse(reportRepository.save(report));
    }

    @Override
    public ReportResponse getReportById(Long id) {
        return mapToResponse(reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id)));
    }

    @Override
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<ReportResponse> getReportsByScope(String scope) {
        return reportRepository.findByScope(ReportScope.valueOf(scope)).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    private ReportResponse mapToResponse(Report r) {
        return ReportResponse.builder()
                .reportId(r.getReportId()).scope(r.getScope())
                .metrics(r.getMetrics()).generatedDate(r.getGeneratedDate()).build();
    }
}
