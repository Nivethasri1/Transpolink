package com.transpolink.traffic.service;

import com.transpolink.traffic.dto.*;

import java.util.List;

public interface TrafficService {
    RoadSegmentResponse createSegment(RoadSegmentRequest request);
    RoadSegmentResponse getSegmentById(Long id);
    List<RoadSegmentResponse> getAllSegments();
    RoadSegmentResponse updateSegmentStatus(Long id, String status);
    TrafficFlowResponse recordFlow(TrafficFlowRequest request);
    List<TrafficFlowResponse> getFlowsBySegment(Long segmentId);
}
