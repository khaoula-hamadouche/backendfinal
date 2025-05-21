package com.example.dossiers_service;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierCME_Attribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "dossier_id")
    @JsonBackReference
    private DossierCME dossier;

    private String nomFournisseur;
    private Double montantContrat;
    private Integer dureeContrat;
    private Integer delaiRealisation;
    private String typologidemarche;
    private String garantie;

    private Integer experiencefournisseur;
    private Integer nombredeprojetssimilaires;
    private Integer notationinterne;
    private Integer chiffreaffaire;
    private String situationfiscale;
    private String fournisseurblacklist;
    private String typefournisseur;  // Case à cocher : Fournisseur étranger
    private boolean fournisseurEtrangerInstallationPermanente;  // Case à cocher : Fournisseur étranger avec installation permanente
    private boolean originePaysNonDoubleImposition;  // Case à cocher : Origine du pays avec une commission de non-double imposition

    // Getters et setters
}
