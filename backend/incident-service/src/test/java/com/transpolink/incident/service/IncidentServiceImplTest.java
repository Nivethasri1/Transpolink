package com.transpolink.incident.service;

import com.transpolink.incident.dto.*;
import com.transpolink.incident.entity.Incident;
import com.transpolink.incident.entity.Resolution;
import com.transpolink.incident.enums.IncidentStatus;
import com.transpolink.incident.enums.IncidentType;
import com.transpolink.incident.enums.ResolutionStatus;
import com.transpolink.incident.exception.IncidentNotFoundException;
import com.transpolink.incident.repository.IncidentRepository;
import com.transpolink.incident.repository.ResolutionRepository;
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
class IncidentServiceImplTest {

    @Mock IncidentRepository incidentRepository;
    @Mock ResolutionRepository resolutionRepository;

    @InjectMocks IncidentServiceImpl incidentService;

    private Incident incident;
    private Resolution resolution;

    @BeforeEach
    void setUp() {
        incident = Incident.builder()
                .incidentId(1L).reporterId(10L)
                .type(IncidentType.ACCIDENT).location("Main St")
                .date(LocalDateTime.now()).status(IncidentStatus.REPORTED).build();

        resolution = Resolution.builder()
                .resolutionId(1L).incidentId(1L).officerId(5L)
                .actions("Cleared road").date(LocalDateTime.now())
                .status(ResolutionStatus.PENDING).build();
    }

    @Test
    void createIncident_success() {
        IncidentRequest req = new IncidentRequest();
        req.setReporterId(10L); req.setType(IncidentType.ACCIDENT); req.setLocation("Main St");

        when(incidentRepository.save(any(Incident.class))).thenReturn(incident);

        IncidentResponse response = incidentService.createIncident(req);

        assertThat(response.getIncidentId()).isEqualTo(1L);
        assertThat(response.getType()).isEqualTo(IncidentType.ACCIDENT);
        assertThat(response.getLocation()).isEqualTo("Main St");
        verify(incidentRepository).save(any(Incident.class));
    }

    @Test
    void getIncidentById_success() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));

        IncidentResponse response = incidentService.getIncidentById(1L);

        assertThat(response.getIncidentId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(IncidentStatus.REPORTED);
    }

    @Test
    void getIncidentById_throwsWhenNotFound() {
        when(incidentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidentService.getIncidentById(99L))
                .isInstanceOf(IncidentNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getAllIncidents_returnsList() {
        when(incidentRepository.findAll()).thenReturn(List.of(incident));

        List<IncidentResponse> result = incidentService.getAllIncidents();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLocation()).isEqualTo("Main St");
    }

    @Test
    void updateStatus_success() {
        when(incidentRepository.findById(1L)).thenReturn(Optional.of(incident));
        when(incidentRepository.save(any(Incident.class))).thenReturn(incident);

        IncidentResponse response = incidentService.updateStatus(1L, "IN_PROGRESS");

        verify(incidentRepository).save(incident);
        assertThat(response).isNotNull();
    }

    @Test
    void updateStatus_throwsWhenNotFound() {
        when(incidentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> incidentService.updateStatus(99L, "IN_PROGRESS"))
                .isInstanceOf(IncidentNotFoundException.class);
    }

    @Test
    void addResolution_success() {
        ResolutionRequest req = new ResolutionRequest();
        req.setIncidentId(1L); req.setOfficerId(5L); req.setActions("Cleared road");

        when(incidentRepository.existsById(1L)).thenReturn(true);
        when(resolutionRepository.save(any(Resolution.class))).thenReturn(resolution);

        ResolutionResponse response = incidentService.addResolution(req);

        assertThat(response.getResolutionId()).isEqualTo(1L);
        assertThat(response.getActions()).isEqualTo("Cleared road");
    }

    @Test
    void addResolution_throwsWhenIncidentNotFound() {
        ResolutionRequest req = new ResolutionRequest();
        req.setIncidentId(99L);
        when(incidentRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> incidentService.addResolution(req))
                .isInstanceOf(IncidentNotFoundException.class);
    }

    @Test
    void getResolutionsByIncident_returnsList() {
        when(resolutionRepository.findByIncidentId(1L)).thenReturn(List.of(resolution));

        List<ResolutionResponse> result = incidentService.getResolutionsByIncident(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getOfficerId()).isEqualTo(5L);
    }
}
