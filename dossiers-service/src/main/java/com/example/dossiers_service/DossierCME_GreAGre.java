package com.example.dossiers_service;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierCME_GreAGre  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "dossier_id")
    @JsonBackReference
    private DossierCME dossier;


    private Double montantEstime;
    private Double budgetEstime;
    private Integer dureeContrat;  // Durée du contrat en mois/années
    private Integer delaiRealisation;  // Durée de la réalisation en mois/années

    // Getters et setters
}
