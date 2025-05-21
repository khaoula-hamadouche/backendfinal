package com.example.dossiers_service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface DossierCME_LancementRepository extends JpaRepository<DossierCME_Lancement, Long> {
    Optional<DossierCME_Lancement> findByDossier(DossierCME dossier);
}
