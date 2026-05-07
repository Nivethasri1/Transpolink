package com.transpolink.identity.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transpolink.identity.config.SecurityConfig;
import com.transpolink.identity.dto.*;
import com.transpolink.identity.enums.Role;
import com.transpolink.identity.enums.UserStatus;
import com.transpolink.identity.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class) // bring in your custom security config
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean UserService userService;

    @Test
    void register_returns200() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setName("Alice"); req.setRole(Role.CITIZEN);
        req.setEmail("alice@test.com"); req.setPhone("123"); req.setPassword("pass");

        AuthResponse resp = new AuthResponse("token", "CITIZEN", 1L);
        when(userService.register(any())).thenReturn(resp);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"))
                .andExpect(jsonPath("$.role").value("CITIZEN"));
    }

    @Test
    void login_returns200() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("alice@test.com"); req.setPassword("pass");

        AuthResponse resp = new AuthResponse("token", "CITIZEN", 1L);
        when(userService.login(any())).thenReturn(resp);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token"));
    }

    @Test
    @WithMockUser(username = "test", roles = {"ADMIN"})
    void getUser_returns200() throws Exception {
        UserResponse resp = UserResponse.builder()
                .userId(1L).name("Alice").role(Role.CITIZEN)
                .email("alice@test.com").status(UserStatus.ACTIVE).build();
        when(userService.getUserById(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.name").value("Alice"));
    }

    @Test
    @WithMockUser(username = "test", roles = {"ADMIN"})
    void getAllUsers_returns200() throws Exception {
        UserResponse resp = UserResponse.builder()
                .userId(1L).name("Alice").role(Role.CITIZEN)
                .email("alice@test.com").status(UserStatus.ACTIVE).build();
        when(userService.getAllUsers()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alice"));
    }

    @Test
    @WithMockUser(username = "test", roles = {"ADMIN"})
    void deleteUser_returns204() throws Exception {
        doNothing().when(userService).deleteUser(1L);

        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent());
    }
}
