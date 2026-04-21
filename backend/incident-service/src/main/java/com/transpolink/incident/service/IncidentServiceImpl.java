package com.transpolink.incident.service;

import com.transpolink.incident.dto.*;
import com.transpolink.incident.entity.Incident;
import com.transpolink.incident.entity.Resolution;
import com.transpolink.incident.enums.IncidentStatus;
import com.transpolink.incident.exception.IncidentNotFoundException;
import com.transpolink.incident.repository.IncidentRepository;
import com.transpolink.incident.repository.ResolutionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final ResolutionRepository resolutionRepository;

    @Override
    public IncidentResponse createIncident(IncidentRequest request) {
        Incident incident = Incident.builder()
                .reporterId(request.getReporterId())
                .type(request.getType())
                .location(request.getLocation())
                .build();
        return mapToResponse(incidentRepository.save(incident));
    }

    @Override
    public IncidentResponse getIncidentById(Long id) {
        return mapToResponse(incidentRepository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException("Incident not found: " + id)));
    }

    @Override
    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public IncidentResponse updateStatus(Long id, String status) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IncidentNotFoundException("Incident not found: " + id));
        incident.setStatus(IncidentStatus.valueOf(status));
        return mapToResponse(incidentRepository.save(incident));
    }

    @Override
    public ResolutionResponse addResolution(ResolutionRequest request) {
        if (!incidentRepository.existsById(request.getIncidentId())) {
            throw new IncidentNotFoundException("Incident not found: " + request.getIncidentId());
        }
        Resolution resolution = Resolution.builder()
                .incidentId(request.getIncidentId())
                .officerId(request.getOfficerId())
                .actions(request.getActions())
                .build();
        return mapToResolutionResponse(resolutionRepository.save(resolution));
    }

    @Override
    public List<ResolutionResponse> getResolutionsByIncident(Long incidentId) {
        return resolutionRepository.findByIncidentId(incidentId).stream()
                .map(this::mapToResolutionResponse).collect(Collectors.toList());
    }

    private IncidentResponse mapToResponse(Incident i) {
        return IncidentResponse.builder()
                .incidentId(i.getIncidentId()).reporterId(i.getReporterId())
                .type(i.getType()).location(i.getLocation())
                .date(i.getDate()).status(i.getStatus()).build();
    }

    private ResolutionResponse mapToResolutionResponse(Resolution r) {
        return ResolutionResponse.builder()
                .resolutionId(r.getResolutionId()).incidentId(r.getIncidentId())
                .officerId(r.getOfficerId()).actions(r.getActions())
                .date(r.getDate()).status(r.getStatus()).build();
    }
}
