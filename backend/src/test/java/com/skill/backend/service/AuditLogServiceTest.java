package com.skill.backend.service;

import com.skill.backend.entity.AuditLog;
import com.skill.backend.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AuditLogService auditLogService;

    @Test
    void logAuthentication_shouldSaveSuccessLog() {
        auditLogService.logAuthentication("user-1", "LOGIN", true);
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logAuthentication_shouldSaveFailureLog() {
        auditLogService.logAuthentication("user-1", "LOGIN", false);
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logAction_shouldSaveLogWithStates() throws Exception {
        Object oldState = new Object();
        Object newState = new Object();
        when(objectMapper.writeValueAsString(oldState)).thenReturn("{}");
        when(objectMapper.writeValueAsString(newState)).thenReturn("{}");

        auditLogService.logAction("user-1", "UPDATE", "USER", oldState, newState);

        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
        verify(objectMapper, times(2)).writeValueAsString(any());
    }

    @Test
    void logAction_shouldHandleNullStates() throws Exception {
        auditLogService.logAction("user-1", "DELETE", "USER", null, null);
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
        verify(objectMapper, never()).writeValueAsString(any());
    }

    @Test
    void logAction_shouldHandleException() throws Exception {
        Object state = new Object();
        when(objectMapper.writeValueAsString(state)).thenThrow(new RuntimeException("JSON Error"));

        // Should not throw exception
        auditLogService.logAction("user-1", "UPDATE", "USER", state, null);

        verify(auditLogRepository, never()).save(any(AuditLog.class));
    }

    @Test
    void logProfilUpdate_shouldLogAction() throws Exception {
        auditLogService.logProfilUpdate("user-1", "emp-1", null, null);
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logAutoEvaluation_shouldLogAction() throws Exception {
        auditLogService.logAutoEvaluation("user-1", "comp-1", 3, "good");
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }

    @Test
    void logValidationManager_shouldLogAction() throws Exception {
        auditLogService.logValidationManager("mgr-1", "ce-1", 4);
        verify(auditLogRepository, times(1)).save(any(AuditLog.class));
    }
}
