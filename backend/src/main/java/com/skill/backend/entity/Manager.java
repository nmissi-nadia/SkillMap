package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "manager")
@Getter
@Setter
@NoArgsConstructor
public class Manager extends Utilisateur {

    private String departementResponsable;

    @OneToMany(mappedBy = "manager")
    private Set<Employe> employes = new HashSet<>();

    @OneToMany(mappedBy = "manager")
    private Set<Evaluation> evaluations = new HashSet<>();

    @OneToMany
    @JoinColumn(name = "manager_id")
    private Set<Projet> projets = new HashSet<>();

}
