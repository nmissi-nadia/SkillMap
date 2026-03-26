package com.skill.backend.controller;

import com.skill.backend.dto.AuditLogDTO;
import com.skill.backend.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@Tag(name = "Audit Logs", description = "Consultation des logs d'audit (RH uniquement)")
@SecurityRequirement(name = "bearerAuth")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_RH')")
    @Operation(summary = "Lister tous les logs d'audit",
               description = "Récupère la liste paginée de toutes les actions enregistrées")
    public ResponseEntity<Page<AuditLogDTO>> getAllLogs(Pageable pageable) {
        return ResponseEntity.ok(auditLogService.getAllLogs(pageable));
    }
}
