package com.skill.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "chef_projet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChefProjet extends Utilisateur {

    private String domaine;

    @OneToMany
    @JoinColumn(name = "chef_projet_id")
    private Set<Projet> projets = new HashSet<>();

    @OneToMany
    @JoinColumn(name = "chef_projet_id")
    private Set<AffectationProjet> affectations = new HashSet<>();

    @OneToMany
    @JoinColumn(name = "chef_projet_id")
    private Set<Message> messagesProjet = new HashSet<>();

}
