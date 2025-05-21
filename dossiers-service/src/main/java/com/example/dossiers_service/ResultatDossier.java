package com.example.dossiers_service;



import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultatDossier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String resultat;
    private String compteRendu;
    private LocalDateTime dateAjout;

    private Long chargeDossierId; // L'utilisateur qui a ajouté ce résultat

    @ManyToOne
    @JoinColumn(name = "dossier_id")
    @JsonBackReference
    private DossierCME dossier;

    @PrePersist
    public void onCreate() {
        this.dateAjout = LocalDateTime.now();
    }
}
