package com.example.dossiers_service;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
@JsonInclude(JsonInclude.Include.NON_NULL)

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DossierCME {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numeroDossier;

    private String intitule;

    @Enumerated(EnumType.STRING)
    private EtatDossier etat = EtatDossier.EN_ATTENTE;

    @Enumerated(EnumType.STRING)
    private TypePassation typePassation;

    private LocalDateTime dateSoumission;
    private Long chargeDossierId; // L'initiateur du dossier (si pertinent de le garder)

    @ElementCollection
    @CollectionTable(name = "dossier_file_details", joinColumns = @JoinColumn(name = "dossier_id"))
    private Map<String, String> fileDetails = new HashMap<>();

    @OneToOne(mappedBy = "dossier", cascade = CascadeType.ALL)
    @JsonManagedReference
    private DossierCME_Lancement lancement;

    @OneToOne(mappedBy = "dossier", cascade = CascadeType.ALL)
    @JsonManagedReference
    private DossierCME_GreAGre greAGre;

    @OneToOne(mappedBy = "dossier", cascade = CascadeType.ALL)
    @JsonManagedReference
    private DossierCME_Avenant avenant;

    @OneToOne(mappedBy = "dossier", cascade = CascadeType.ALL)
    @JsonManagedReference
    private DossierCME_Attribution attribution;

    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ResultatDossier> resultats;

    @PrePersist
    protected void onCreate() {
        this.dateSoumission = LocalDateTime.now();
        this.etat = EtatDossier.EN_ATTENTE;
    }
}