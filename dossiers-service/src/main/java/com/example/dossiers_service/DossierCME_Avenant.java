package com.example.dossiers_service;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierCME_Avenant  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "dossier_id")
    @JsonBackReference
    private DossierCME dossier;

    private String numeroContrat;
    private String dateSignatureContrat;
    private Integer dureeContrat;  // Durée du contrat initial en mois/années
    private String dateExpirationContrat;
    private Double montantContrat;  // Montant du contrat initial
    private String objetAvenant;  // Objet de l'avenant
    private Double montantAvenant;  // Montant ajouté par l'avenant
    private Integer dureeAvenant;  // Durée de l'avenant en mois/années

    private Double nouveauMontantContrat;
    private Integer nouvelleDureeContrat;

    // Méthode pour calculer automatiquement le nouveau montant et la nouvelle durée
    @PostLoad
    public void calculerNouveauxMontants() {
        this.nouveauMontantContrat = this.montantContrat + this.montantAvenant;
        this.nouvelleDureeContrat = this.dureeContrat + this.dureeAvenant;
    }

    // Getters et setters
}
