package com.skill.backend.controller;

import com.skill.backend.dto.TestEmployeDTO;
import com.skill.backend.service.TestAssignmentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires du contrôleur TestAssignmentController.
 * Teste directement les méthodes du contrôleur sans couche HTTP.
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
        String testId = "test-1";
        String employeId = "emp-1";
        String managerId = "manager@example.com";
        TestEmployeDTO expectedDto = new TestEmployeDTO();

        when(authentication.getName()).thenReturn(managerId);
        when(testAssignmentService.assignTest(testId, employeId, managerId)).thenReturn(expectedDto);

        // Act
        ResponseEntity<TestEmployeDTO> response = testAssignmentController.assignTest(testId, employeId, authentication);

        // Assert
        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo(expectedDto);
        verify(testAssignmentService).assignTest(testId, employeId, managerId);
    }

    @Test
    void assignTest_shouldDelegateToService() {
        when(authentication.getName()).thenReturn("rh@example.com");
        when(testAssignmentService.assignTest(anyString(), anyString(), anyString())).thenReturn(new TestEmployeDTO());

        testAssignmentController.assignTest("t1", "e1", authentication);

        verify(testAssignmentService, times(1)).assignTest("t1", "e1", "rh@example.com");
    }
}
