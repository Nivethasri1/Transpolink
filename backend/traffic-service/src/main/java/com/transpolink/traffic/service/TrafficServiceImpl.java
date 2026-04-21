package com.transpolink.traffic.service;

import com.transpolink.traffic.dto.*;
import com.transpolink.traffic.entity.RoadSegment;
import com.transpolink.traffic.entity.TrafficFlow;
import com.transpolink.traffic.enums.FlowStatus;
import com.transpolink.traffic.enums.SegmentStatus;
import com.transpolink.traffic.exception.ResourceNotFoundException;
import com.transpolink.traffic.repository.RoadSegmentRepository;
import com.transpolink.traffic.repository.TrafficFlowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrafficServiceImpl implements TrafficService {

    private final RoadSegmentRepository segmentRepository;
    private final TrafficFlowRepository flowRepository;

    @Override
    public RoadSegmentResponse createSegment(RoadSegmentRequest request) {
        RoadSegment segment = RoadSegment.builder()
                .location(request.getLocation()).length(request.getLength()).build();
        return mapSegment(segmentRepository.save(segment));
    }

    @Override
    public RoadSegmentResponse getSegmentById(Long id) {
        return mapSegment(segmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Segment not found: " + id)));
    }

    @Override
    public List<RoadSegmentResponse> getAllSegments() {
        return segmentRepository.findAll().stream().map(this::mapSegment).collect(Collectors.toList());
    }

    @Override
    public RoadSegmentResponse updateSegmentStatus(Long id, String status) {
        RoadSegment segment = segmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Segment not found: " + id));
        segment.setStatus(SegmentStatus.valueOf(status));
        return mapSegment(segmentRepository.save(segment));
    }

    @Override
    public TrafficFlowResponse recordFlow(TrafficFlowRequest request) {
        if (!segmentRepository.existsById(request.getSegmentId())) {
            throw new ResourceNotFoundException("Segment not found: " + request.getSegmentId());
        }
        FlowStatus flowStatus = request.getSpeed() < 20 ? FlowStatus.HEAVY :
                request.getSpeed() < 40 ? FlowStatus.SLOW : FlowStatus.NORMAL;
        TrafficFlow flow = TrafficFlow.builder()
                .segmentId(request.getSegmentId())
                .volume(request.getVolume())
                .speed(request.getSpeed())
                .status(flowStatus)
                .build();
        return mapFlow(flowRepository.save(flow));
    }

    @Override
    public List<TrafficFlowResponse> getFlowsBySegment(Long segmentId) {
        return flowRepository.findBySegmentId(segmentId).stream().map(this::mapFlow).collect(Collectors.toList());
    }

    private RoadSegmentResponse mapSegment(RoadSegment s) {
        return RoadSegmentResponse.builder()
                .segmentId(s.getSegmentId()).location(s.getLocation())
                .length(s.getLength()).status(s.getStatus()).build();
    }

    private TrafficFlowResponse mapFlow(TrafficFlow f) {
        return TrafficFlowResponse.builder()
                .flowId(f.getFlowId()).segmentId(f.getSegmentId())
                .volume(f.getVolume()).speed(f.getSpeed())
                .date(f.getDate()).status(f.getStatus()).build();
    }
}
