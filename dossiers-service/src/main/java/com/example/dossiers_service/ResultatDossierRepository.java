package com.example.dossiers_service;


import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultatDossierRepository extends JpaRepository<ResultatDossier, Long> {
        List<ResultatDossier> findByChargeDossierId(Long chargeDossierId);
        Optional<ResultatDossier> findByDossierId(Long dossierId);
        List<ResultatDossier> findAllByDossierId(Long dossierId);
        Optional<ResultatDossier> findByDossierIdAndChargeDossierId(Long dossierId, Long chargeDossierId); //
    ResultatDossier findByDossier_IdAndChargeDossierId(Long dossierId, Long chargeDossierId);
// ✔️
    }



