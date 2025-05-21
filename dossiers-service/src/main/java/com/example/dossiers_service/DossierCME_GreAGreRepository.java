package com.example.dossiers_service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface DossierCME_GreAGreRepository extends JpaRepository<DossierCME_GreAGre, Long> {
    Optional<DossierCME_GreAGre> findByDossier(DossierCME dossier);
}
