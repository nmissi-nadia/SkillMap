package com.skill.backend.controller;

import com.skill.backend.dto.*;
import com.skill.backend.service.FormationService;
import com.skill.backend.service.InscriptionFormationService;
import com.skill.backend.service.RessourceFormationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class FormationController {

    private final FormationService formationService;
    private final RessourceFormationService ressourceService;
    private final InscriptionFormationService inscriptionService;

    @PostMapping("/formations")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_RH')")
    public ResponseEntity<FormationDetailDTO> createFormation(@RequestBody CreateFormationRequestDTO dto) {
        return ResponseEntity.ok(formationService.createFormation(dto));
    }

    @GetMapping("/formations")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER', 'ROLE_CHEF_PROJET', 'ROLE_EMPLOYE')")
    public ResponseEntity<List<FormationDetailDTO>> getAllFormations() {
        return ResponseEntity.ok(formationService.getAllFormations());
    }

    @GetMapping("/formations/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER', 'ROLE_CHEF_PROJET', 'ROLE_EMPLOYE')")
    public ResponseEntity<FormationDetailDTO> getFormationById(@PathVariable String id) {
        return ResponseEntity.ok(formationService.getFormationById(id));
    }

    @PostMapping("/formations/{id}/ressources")
    @org.springframework.security.access.prepost.PreAuthorize("hasAuthority('ROLE_RH')")
    public ResponseEntity<RessourceFormationDTO> addResourceToFormation(
            @PathVariable("id") String formationId,
            @RequestBody CreateRessourceDTO dto) {
        return ResponseEntity.ok(ressourceService.addResourceToFormation(formationId, dto));
    }

    @PostMapping("/formations/{id}/inscriptions/{employeeId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER')")
    public ResponseEntity<InscriptionDTO> assignFormationToEmployee(
            @PathVariable("id") String formationId,
            @PathVariable("employeeId") String employeeId) {
        return ResponseEntity.ok(inscriptionService.assignFormationToEmployee(formationId, employeeId));
    }

    @GetMapping("/employes/{employeeId}/formations")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyAuthority('ROLE_RH', 'ROLE_MANAGER', 'ROLE_EMPLOYE')")
    public ResponseEntity<List<FormationDetailDTO>> getEmployeeFormations(
            @PathVariable("employeeId") String employeeId) {
        return ResponseEntity.ok(inscriptionService.getEmployeeFormations(employeeId));
    }
}
