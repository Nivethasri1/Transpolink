package com.transpolink.reporting.service;

import com.transpolink.reporting.dto.ReportRequest;
import com.transpolink.reporting.dto.ReportResponse;

import java.util.List;

public interface ReportingService {
    ReportResponse generateReport(ReportRequest request);
    ReportResponse getReportById(Long id);
    List<ReportResponse> getAllReports();
    List<ReportResponse> getReportsByScope(String scope);
}
