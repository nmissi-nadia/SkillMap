package com.skill.backend.controller;

import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.dto.TestAssignmentRequestDTO;
import com.skill.backend.service.TestAssignmentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du contrôleur TestAssignmentController.
 */
@ExtendWith(MockitoExtension.class)
class TestAssignmentControllerTest {

    @Mock
    private TestAssignmentService testAssignmentService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TestAssignmentController testAssignmentController;

    @Test
    void assignTest_shouldReturnOk_whenCalledByManager() {
        // Arrange
        String managerId = "manager@example.com";
        TestAssignmentRequestDTO request = new TestAssignmentRequestDTO("test-1", "emp-1", LocalDateTime.now());
        TestEmployeDTO expectedDto = new TestEmployeDTO();

        when(authentication.getName()).thenReturn(managerId);
        when(testAssignmentService.assignTest(eq("test-1"), eq("emp-1"), eq(managerId), any())).thenReturn(expectedDto);

        // Act
        ResponseEntity<TestEmployeDTO> response = testAssignmentController.assignTest(request, authentication);

        // Assert
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedDto);
        verify(testAssignmentService).assignTest(eq("test-1"), eq("emp-1"), eq(managerId), any());
    }

    @Test
    void assignTest_shouldDelegateToService() {
        TestAssignmentRequestDTO request = new TestAssignmentRequestDTO("t1", "e1", null);
        when(authentication.getName()).thenReturn("rh@example.com");
        when(testAssignmentService.assignTest(anyString(), anyString(), anyString(), any())).thenReturn(new TestEmployeDTO());

        testAssignmentController.assignTest(request, authentication);

        verify(testAssignmentService, times(1)).assignTest(eq("t1"), eq("e1"), eq("rh@example.com"), eq(null));
    }
}
