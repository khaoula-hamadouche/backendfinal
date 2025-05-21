package com.example.dossiers_service;
import java.util.List;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class ResultatDossierService {

    private final ResultatDossierRepository resultatRepo;
    private final DossierRepository dossierRepo;
    private final UserServiceClient userServiceClient;
    private final JwtUtil jwtUtil;

    // Ajouter un résultat (déjà fait)
    public ResultatDossier ajouterResultat(Long dossierId, String resultat, String compteRendu, HttpServletRequest request) {
        String jwtToken = JwtUtil.extractTokenFromCookie(request);
        if (jwtToken == null) throw new IllegalArgumentException("❌ Token JWT non trouvé !");
        if (!jwtUtil.validateToken(jwtToken)) throw new RuntimeException("❌ Token JWT invalide ou expiré !");
        Long userId = jwtUtil.extractUserId(jwtToken);
        if (userId == null) throw new RuntimeException("❌ Impossible d'extraire l'ID utilisateur depuis le token JWT !");
        String cookieHeader = "jwt=" + jwtToken;
        UserDTO utilisateur = userServiceClient.getUserById(userId, cookieHeader);
        if (utilisateur == null) throw new RuntimeException("❌ Utilisateur non trouvé via l'ID du token.");

        Long chargeDossierId = utilisateur.getId();
        DossierCME dossier = dossierRepo.findById(dossierId).orElseThrow(() -> new RuntimeException("❌ Dossier non trouvé"));
        if (resultatRepo.findByDossier_IdAndChargeDossierId(dossierId, chargeDossierId) != null) {
            throw new RuntimeException("⚠️ Vous avez déjà ajouté un résultat pour ce dossier.");
        }

        ResultatDossier res = ResultatDossier.builder()
                .dossier(dossier)
                .chargeDossierId(chargeDossierId)
                .resultat(resultat)
                .compteRendu(compteRendu)
                .build();

        return resultatRepo.save(res);
    }
    public List<ResultatDossier> getAllResultatsByDossierId(Long dossierId, HttpServletRequest request) {
        String jwtToken = JwtUtil.extractTokenFromCookie(request);
        if (jwtToken == null || !jwtUtil.validateToken(jwtToken)) {
            throw new RuntimeException("Token JWT invalide ou absent");
        }
        Long userId = jwtUtil.extractUserId(jwtToken);
        if (userId == null) {
            throw new RuntimeException("Impossible d'extraire l'ID utilisateur");
        }

        // Optionnel : vérifier que l'utilisateur a le droit d'accéder au dossier

        return resultatRepo.findAllByDossierId(dossierId);
    }

    public ResultatDossier getResultatByDossierId(Long dossierId, HttpServletRequest request) {
        String jwtToken = JwtUtil.extractTokenFromCookie(request);
        if (jwtToken == null || !jwtUtil.validateToken(jwtToken)) {
            throw new RuntimeException("Token JWT invalide ou absent");
        }

        Long userId = jwtUtil.extractUserId(jwtToken);
        if (userId == null) {
            throw new RuntimeException("Impossible d'extraire l'ID utilisateur");
        }

        return resultatRepo.findByDossierIdAndChargeDossierId(dossierId, userId).orElse(null);
    }

    // Récupérer tous les résultats
    public List<ResultatDossier> getAllResultats() {
        return resultatRepo.findAll();
    }

    // Récupérer les résultats d'un utilisateur (via JWT)
    public List<ResultatDossier> getMesResultats(HttpServletRequest request) {
        String jwtToken = JwtUtil.extractTokenFromCookie(request);
        if (jwtToken == null) throw new IllegalArgumentException("❌ Token JWT non trouvé !");
        if (!jwtUtil.validateToken(jwtToken)) throw new RuntimeException("❌ Token JWT invalide ou expiré !");
        Long userId = jwtUtil.extractUserId(jwtToken);
        if (userId == null) throw new RuntimeException("❌ Impossible d'extraire l'ID utilisateur depuis le token JWT !");
        return resultatRepo.findByChargeDossierId(userId);
    }

    // Modifier un résultat existant (seulement si c’est le créateur)
    public ResultatDossier updateResultat(Long resultatId, String resultat, String compteRendu, HttpServletRequest request) {
        String jwtToken = JwtUtil.extractTokenFromCookie(request);
        if (jwtToken == null) throw new IllegalArgumentException("❌ Token JWT non trouvé !");
        if (!jwtUtil.validateToken(jwtToken)) throw new RuntimeException("❌ Token JWT invalide ou expiré !");
        Long userId = jwtUtil.extractUserId(jwtToken);
        if (userId == null) throw new RuntimeException("❌ Impossible d'extraire l'ID utilisateur depuis le token JWT !");

        ResultatDossier res = resultatRepo.findById(resultatId)
                .orElseThrow(() -> new RuntimeException("❌ Résultat non trouvé"));
        if (!res.getChargeDossierId().equals(userId)) {
            throw new RuntimeException("❌ Vous n'êtes pas autorisé à modifier ce résultat.");
        }
        res.setResultat(resultat);
        res.setCompteRendu(compteRendu);

        return resultatRepo.save(res);
    }

    // Supprimer un résultat (seulement si c’est le créateur)
    public void deleteResultat(Long resultatId, HttpServletRequest request) {
        String jwtToken = JwtUtil.extractTokenFromCookie(request);
        if (jwtToken == null) throw new IllegalArgumentException("❌ Token JWT non trouvé !");
        if (!jwtUtil.validateToken(jwtToken)) throw new RuntimeException("❌ Token JWT invalide ou expiré !");
        Long userId = jwtUtil.extractUserId(jwtToken);
        if (userId == null) throw new RuntimeException("❌ Impossible d'extraire l'ID utilisateur depuis le token JWT !");

        ResultatDossier res = resultatRepo.findById(resultatId)
                .orElseThrow(() -> new RuntimeException("❌ Résultat non trouvé"));
        if (!res.getChargeDossierId().equals(userId)) {
            throw new RuntimeException("❌ Vous n'êtes pas autorisé à supprimer ce résultat.");
        }

        resultatRepo.delete(res);
    }
}
