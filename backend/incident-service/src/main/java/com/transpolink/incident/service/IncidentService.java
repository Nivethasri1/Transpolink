package com.transpolink.incident.service;

import com.transpolink.incident.dto.*;

import java.util.List;

public interface IncidentService {
    IncidentResponse createIncident(IncidentRequest request, Long reporterId);
    IncidentResponse getIncidentById(Long id);
    List<IncidentResponse> getAllIncidents();
    IncidentResponse updateStatus(Long id, String status);
    ResolutionResponse addResolution(ResolutionRequest request);
    List<ResolutionResponse> getResolutionsByIncident(Long incidentId);
    ResolutionResponse updateResolutionStatus(Long id, String status);
}
