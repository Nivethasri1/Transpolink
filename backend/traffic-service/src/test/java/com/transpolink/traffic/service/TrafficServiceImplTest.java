package com.transpolink.traffic.service;

import com.transpolink.traffic.dto.*;
import com.transpolink.traffic.entity.RoadSegment;
import com.transpolink.traffic.entity.TrafficFlow;
import com.transpolink.traffic.enums.FlowStatus;
import com.transpolink.traffic.enums.SegmentStatus;
import com.transpolink.traffic.exception.ResourceNotFoundException;
import com.transpolink.traffic.repository.RoadSegmentRepository;
import com.transpolink.traffic.repository.TrafficFlowRepository;
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
class TrafficServiceImplTest {

    @Mock RoadSegmentRepository segmentRepository;
    @Mock TrafficFlowRepository flowRepository;

    @InjectMocks TrafficServiceImpl trafficService;

    private RoadSegment segment;
    private TrafficFlow flow;

    @BeforeEach
    void setUp() {
        segment = RoadSegment.builder()
                .segmentId(1L).location("Highway 1").length(5.0).status(SegmentStatus.OPEN).build();

        flow = TrafficFlow.builder()
                .flowId(1L).segmentId(1L).volume(200).speed(60.0)
                .date(LocalDateTime.now()).status(FlowStatus.NORMAL).build();
    }

    @Test
    void createSegment_success() {
        RoadSegmentRequest req = new RoadSegmentRequest();
        req.setLocation("Highway 1"); req.setLength(5.0);

        when(segmentRepository.save(any(RoadSegment.class))).thenReturn(segment);

        RoadSegmentResponse response = trafficService.createSegment(req);

        assertThat(response.getSegmentId()).isEqualTo(1L);
        assertThat(response.getLocation()).isEqualTo("Highway 1");
        assertThat(response.getStatus()).isEqualTo(SegmentStatus.OPEN);
    }

    @Test
    void getSegmentById_success() {
        when(segmentRepository.findById(1L)).thenReturn(Optional.of(segment));

        RoadSegmentResponse response = trafficService.getSegmentById(1L);

        assertThat(response.getSegmentId()).isEqualTo(1L);
        assertThat(response.getLength()).isEqualTo(5.0);
    }

    @Test
    void getSegmentById_throwsWhenNotFound() {
        when(segmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> trafficService.getSegmentById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getAllSegments_returnsList() {
        when(segmentRepository.findAll()).thenReturn(List.of(segment));

        List<RoadSegmentResponse> result = trafficService.getAllSegments();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLocation()).isEqualTo("Highway 1");
    }

    @Test
    void updateSegmentStatus_success() {
        when(segmentRepository.findById(1L)).thenReturn(Optional.of(segment));
        when(segmentRepository.save(any(RoadSegment.class))).thenReturn(segment);

        RoadSegmentResponse response = trafficService.updateSegmentStatus(1L, "CLOSED");

        verify(segmentRepository).save(segment);
        assertThat(response).isNotNull();
    }

    @Test
    void updateSegmentStatus_throwsWhenNotFound() {
        when(segmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> trafficService.updateSegmentStatus(99L, "CLOSED"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void recordFlow_normalSpeed_setsNormalStatus() {
        TrafficFlowRequest req = new TrafficFlowRequest();
        req.setSegmentId(1L); req.setVolume(200); req.setSpeed(60.0);

        when(segmentRepository.existsById(1L)).thenReturn(true);
        when(flowRepository.save(any(TrafficFlow.class))).thenReturn(flow);

        TrafficFlowResponse response = trafficService.recordFlow(req);

        assertThat(response.getFlowId()).isEqualTo(1L);
        assertThat(response.getVolume()).isEqualTo(200);
    }

    @Test
    void recordFlow_slowSpeed_setsSlowStatus() {
        TrafficFlowRequest req = new TrafficFlowRequest();
        req.setSegmentId(1L); req.setVolume(300); req.setSpeed(30.0);

        TrafficFlow slowFlow = TrafficFlow.builder()
                .flowId(2L).segmentId(1L).volume(300).speed(30.0)
                .date(LocalDateTime.now()).status(FlowStatus.SLOW).build();

        when(segmentRepository.existsById(1L)).thenReturn(true);
        when(flowRepository.save(any(TrafficFlow.class))).thenReturn(slowFlow);

        TrafficFlowResponse response = trafficService.recordFlow(req);

        assertThat(response.getStatus()).isEqualTo(FlowStatus.SLOW);
    }

    @Test
    void recordFlow_heavySpeed_setsHeavyStatus() {
        TrafficFlowRequest req = new TrafficFlowRequest();
        req.setSegmentId(1L); req.setVolume(500); req.setSpeed(10.0);

        TrafficFlow heavyFlow = TrafficFlow.builder()
                .flowId(3L).segmentId(1L).volume(500).speed(10.0)
                .date(LocalDateTime.now()).status(FlowStatus.HEAVY).build();

        when(segmentRepository.existsById(1L)).thenReturn(true);
        when(flowRepository.save(any(TrafficFlow.class))).thenReturn(heavyFlow);

        TrafficFlowResponse response = trafficService.recordFlow(req);

        assertThat(response.getStatus()).isEqualTo(FlowStatus.HEAVY);
    }

    @Test
    void recordFlow_throwsWhenSegmentNotFound() {
        TrafficFlowRequest req = new TrafficFlowRequest();
        req.setSegmentId(99L); req.setVolume(100); req.setSpeed(50.0);

        when(segmentRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> trafficService.recordFlow(req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getFlowsBySegment_returnsList() {
        when(flowRepository.findBySegmentId(1L)).thenReturn(List.of(flow));

        List<TrafficFlowResponse> result = trafficService.getFlowsBySegment(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSpeed()).isEqualTo(60.0);
    }
}
