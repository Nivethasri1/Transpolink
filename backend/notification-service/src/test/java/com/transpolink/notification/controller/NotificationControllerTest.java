package com.transpolink.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transpolink.notification.config.SecurityConfig;
import com.transpolink.notification.dto.NotificationRequest;
import com.transpolink.notification.dto.NotificationResponse;
import com.transpolink.notification.enums.NotificationCategory;
import com.transpolink.notification.enums.NotificationStatus;
import com.transpolink.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@Import(SecurityConfig.class)
class NotificationControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean NotificationService notificationService;
    @MockBean com.transpolink.notification.config.JwtAuthFilter jwtAuthFilter;

    private NotificationResponse buildResponse() {
        return NotificationResponse.builder()
                .notificationId(1L).userId(10L).entityId(5L)
                .message("Incident reported on Main St")
                .category(NotificationCategory.INCIDENT)
                .status(NotificationStatus.UNREAD)
                .createdDate(LocalDateTime.now()).build();
    }

    @Test
    @WithMockUser
    void send_returns200() throws Exception {
        NotificationRequest req = new NotificationRequest();
        req.setUserId(10L); req.setEntityId(5L);
        req.setMessage("Incident reported on Main St");
        req.setCategory(NotificationCategory.INCIDENT);

        when(notificationService.send(any())).thenReturn(buildResponse());

        mockMvc.perform(post("/api/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notificationId").value(1))
                .andExpect(jsonPath("$.message").value("Incident reported on Main St"))
                .andExpect(jsonPath("$.status").value("UNREAD"));
    }

    @Test
    @WithMockUser
    void getByUser_returns200() throws Exception {
        when(notificationService.getByUser(10L)).thenReturn(List.of(buildResponse()));

        mockMvc.perform(get("/api/notifications/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(10))
                .andExpect(jsonPath("$[0].category").value("INCIDENT"));
    }

    @Test
    @WithMockUser
    void getUnreadByUser_returns200() throws Exception {
        when(notificationService.getUnreadByUser(10L)).thenReturn(List.of(buildResponse()));

        mockMvc.perform(get("/api/notifications/user/10/unread"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("UNREAD"));
    }

    @Test
    @WithMockUser
    void markAsRead_returns200() throws Exception {
        NotificationResponse readResp = NotificationResponse.builder()
                .notificationId(1L).userId(10L).entityId(5L)
                .message("Incident reported on Main St")
                .category(NotificationCategory.INCIDENT)
                .status(NotificationStatus.READ)
                .createdDate(LocalDateTime.now()).build();

        when(notificationService.markAsRead(1L)).thenReturn(readResp);

        mockMvc.perform(patch("/api/notifications/1/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));
    }
}
