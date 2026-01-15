package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "rh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RH extends Utilisateur {

    private String service;

    @OneToMany
    @JoinColumn(name = "rh_id")
    private Set<Formation> formations = new HashSet<>();

    @OneToMany
    @JoinColumn(name = "rh_id")
    private Set<Projet> projets = new HashSet<>();

    @OneToMany
    @JoinColumn(name = "rh_id")
    private Set<Notification> notifications = new HashSet<>();

    @OneToMany
    @JoinColumn(name = "rh_id")
    private Set<AuditLog> auditLogs = new HashSet<>();

}
