
package com.example.dossiers_service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface DossierCME_AttributionRepository extends JpaRepository<DossierCME_Attribution, Long> {
    Optional<DossierCME_Attribution> findByDossier(DossierCME dossier);
}