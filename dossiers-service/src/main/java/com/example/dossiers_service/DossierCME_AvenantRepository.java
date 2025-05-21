package com.example.dossiers_service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface DossierCME_AvenantRepository extends JpaRepository<DossierCME_Avenant, Long> {
    Optional<DossierCME_Avenant> findByDossier(DossierCME dossier);
}
