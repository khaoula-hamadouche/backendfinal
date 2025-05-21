package com.example.dossiers_service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dossiers")
@RequiredArgsConstructor
@Slf4j  // 🔹 Ajout du logger
public class DossierController {
    private final DossierService dossierService;
    private final DossierRepository dossierRepository;

    @Autowired
    private JwtUtil jwtUtil;
    private static final String COOKIE_NAME = "jwt";

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createDossier(
            @RequestParam String numeroDossier,
            @RequestParam String intitule,
            @RequestParam String typePassation,
            @RequestParam(required = false) Double montantEstime,
            @RequestParam(required = false) Double budgetEstime,
            @RequestParam(required = false) Integer dureeContrat,
            @RequestParam(required = false) Integer delaiRealisation,
            @RequestParam(required = false) String nomFournisseur,
            @RequestParam(required = false) Double montantContrat,
            @RequestParam(required = false) String typefournisseur, // Fournisseur étranger
            @RequestParam(required = false) Boolean fournisseurEtrangerInstallationPermanente,
            @RequestParam(required = false) Boolean originePaysNonDoubleImposition,
            @RequestParam(required = false) String numeroContrat,
            @RequestParam(required = false) String dateExpirationContrat,
            @RequestParam(required = false) String typologidemarche,
            @RequestParam(required = false) String garantie,
            @RequestParam(required = false) Integer experiencefournisseur,
            @RequestParam(required = false) Integer nombredeprojetssimilaires,
            @RequestParam(required = false)  Integer notationinterne,
            @RequestParam(required = false) Integer chiffreaffaire,
            @RequestParam(required = false)  String situationfiscale,
            @RequestParam(required = false) String fournisseurblacklist,
            @RequestParam(required = false) String dateSignatureContrat,
            @RequestParam(required = false) String objetAvenant,
            @RequestParam(required = false) Double montantAvenant,
            @RequestParam(required = false) Integer dureeAvenant,
            @RequestParam(required = false) Double nouveauMontantContrat,
            @RequestParam(required = false) Integer nouvelleDureeContrat,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("fileNames") List<String> fileNames,
            HttpServletRequest request) {

        try {
            // Validation des fichiers
            if (files.length != fileNames.size()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le nombre de fichiers et de noms doit être identique."));
            }

            // Validation JWT
            String token = extractTokenFromCookie(request);
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Token JWT invalide ou expiré !"));
            }
            Long userId = jwtUtil.extractUserId(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Impossible d'extraire l'ID utilisateur !"));
            }


            if (fournisseurEtrangerInstallationPermanente == null) {
                fournisseurEtrangerInstallationPermanente = false; // Valeur par défaut
            }
            if (originePaysNonDoubleImposition == null) {
                originePaysNonDoubleImposition = false; // Valeur par défaut
            }

            // Appel au service métier
            DossierCME dossier = dossierService.createDossier(
                    numeroDossier, intitule, typePassation, montantEstime, budgetEstime, dureeContrat, delaiRealisation,
                    nomFournisseur, montantContrat, files, fileNames, userId, typefournisseur,
                    fournisseurEtrangerInstallationPermanente, originePaysNonDoubleImposition,
                    numeroContrat, dateExpirationContrat,typologidemarche,garantie, experiencefournisseur,
                    nombredeprojetssimilaires,
                    notationinterne,
                    chiffreaffaire,
                    situationfiscale,
                    fournisseurblacklist, dateSignatureContrat, objetAvenant, montantAvenant, dureeAvenant,nouveauMontantContrat, nouvelleDureeContrat, request);

            // Retourner le dossier créé
            return ResponseEntity.status(HttpStatus.CREATED).body(dossier);

        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur de validation : {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            log.error("❌ Erreur interne : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erreur lors de la création du dossier."));
        }
    }




    @GetMapping("/")
    public ResponseEntity<?> getAllCompleteDossiers(HttpServletRequest request) {
        try {
            List<Map<String, Object>> dossiers = dossierService.getAllCompleteDossiers(request);
            return ResponseEntity.ok(dossiers);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage(), "timestamp", System.currentTimeMillis()));
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDossierDetails(@PathVariable Long id, HttpServletRequest request) {
        try {
            // Appel au service pour récupérer les détails
            Map<String, Object> dossierDetails = dossierService.getCompleteDossierById(id, request);

            return ResponseEntity.ok(dossierDetails);
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur de récupération du dossier : {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Erreur interne lors de la récupération du dossier : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erreur interne lors de la récupération du dossier."));
        }
    }
    @GetMapping("/by-type-only/{typePassation}")
    public ResponseEntity<?> getDossiersByTypeOnly(@PathVariable TypePassation typePassation , HttpServletRequest request) {
        try {
            // Appel au service pour récupérer les dossiers du type demandé
            List<Map<String, Object>> dossiers = dossierService.getDossiersByTypeOnly(typePassation , request);
            return ResponseEntity.ok(dossiers);
        } catch (IllegalArgumentException e) {
            // Gérer les erreurs
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/by-type/{typePassation}")
    public ResponseEntity<?> getDossiersByType(@PathVariable TypePassation typePassation, HttpServletRequest request) {
        try {
            // Appel au service pour récupérer les dossiers par type
            Map<String, Object> dossiers = dossierService.getDossiersByType(typePassation, request);
            return ResponseEntity.ok(dossiers);
        } catch (IllegalArgumentException e) {
            // Gérer les erreurs (exemple : type inconnu, utilisateur non autorisé)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
    @GetMapping("/mes-dossiers")
    public ResponseEntity<List<DossierCME>> getDossiersByConnectedUser(HttpServletRequest request) {
        try {
            List<DossierCME> dossiers = dossierService.getDossiersByConnectedUser(request);
            return ResponseEntity.ok(dossiers);
        } catch (IllegalArgumentException e) {
            log.error("❌ Erreur : {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("❌ Erreur interne : {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDossier(@PathVariable Long id, HttpServletRequest request) {
        try {
            dossierService.deleteDossier(id, request);
            return ResponseEntity.ok(Map.of("message", "✅ Dossier supprimé avec succès !"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la suppression du dossier."));
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateDossier(
            @PathVariable Long id,
            @RequestParam String numeroDossier,
            @RequestParam(required = false) String intitule,
            @RequestParam(required = false) String typePassation,
            @RequestParam(required = false) Double montantEstime,
            @RequestParam(required = false) Double budgetEstime,
            @RequestParam(required = false) Integer dureeContrat,
            @RequestParam(required = false) Integer delaiRealisation,
            @RequestParam(required = false) String nomFournisseur,
            @RequestParam(required = false) Double montantContrat,
            @RequestParam(required = false) String typefournisseur,
            @RequestParam(required = false) Boolean fournisseurEtrangerInstallationPermanente,
            @RequestParam(required = false) Boolean originePaysNonDoubleImposition,
            @RequestParam(required = false) String numeroContrat,
            @RequestParam(required = false) String dateExpirationContrat,
            @RequestParam(required = false) String typologidemarche,
            @RequestParam(required = false) String garantie,
            @RequestParam(required = false) Integer experiencefournisseur,
            @RequestParam(required = false) Integer nombredeprojetssimilaires,
            @RequestParam(required = false)  Integer notationinterne,
            @RequestParam(required = false) Integer chiffreaffaire,
            @RequestParam(required = false)  String situationfiscale,
            @RequestParam(required = false) String fournisseurblacklist,
            @RequestParam(required = false) String dateSignatureContrat,
            @RequestParam(required = false) String objetAvenant,
            @RequestParam(required = false) Double montantAvenant,
            @RequestParam(required = false) Integer dureeAvenant,
            HttpServletRequest request) {

        try {
            DossierCME updatedDossier = dossierService.updateDossier(
                    id, numeroDossier, intitule, typePassation, montantEstime, budgetEstime, dureeContrat, delaiRealisation,
                    nomFournisseur, montantContrat, typefournisseur, fournisseurEtrangerInstallationPermanente,
                    originePaysNonDoubleImposition, numeroContrat, dateExpirationContrat,   typologidemarche,
                    garantie , experiencefournisseur,
                    nombredeprojetssimilaires,
                    notationinterne,
                    chiffreaffaire,
                    situationfiscale,
                    fournisseurblacklist,dateSignatureContrat, objetAvenant,
                    montantAvenant, dureeAvenant, request);

            return ResponseEntity.ok(updatedDossier);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erreur lors de la modification du dossier."));
        }
    }


    private String extractTokenFromCookie(HttpServletRequest request) {
        String cookieHeader = request.getHeader("Cookie");
        if (cookieHeader != null) {
            for (String cookie : cookieHeader.split(";")) {
                cookie = cookie.trim();
                if (cookie.startsWith(COOKIE_NAME + "=")) {
                    return cookie.substring((COOKIE_NAME + "=").length());
                }
            }
        }
        return null;
    }

@PutMapping("/{id}/changer-etat")
    public ResponseEntity<DossierCME> changerEtat(
            @PathVariable Long id,
            @RequestParam EtatDossier nouvelEtat) {

        DossierCME updatedDossier = dossierService.changerEtat(id, nouvelEtat);
        return ResponseEntity.ok(updatedDossier);
    }
    @GetMapping("/stats/etat")
    public Map<String, Long> getStatsParEtat() {
        return dossierService.getStatistiquesParEtat();
    }

    @GetMapping("/stats/etat/by-user")
    public ResponseEntity<?> getStatsByEtatForCurrentUser(HttpServletRequest request) {
        try {
            Map<String, Long> stats = dossierService.getStatsEtatByUser(request);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération des statistiques."));
        }
    }


}