package com.example.dossiers_service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resultats")
@RequiredArgsConstructor
public class ResultatDossierController {

    private final ResultatDossierService resultatService;
    @PostMapping("/dossiers/{id}/resultat")
    public ResponseEntity<ResultatDossier> ajouterResultat(
            @PathVariable Long id,
            @RequestParam String resultat,
            @RequestParam String compteRendu,
            HttpServletRequest request) {

        ResultatDossier res = resultatService.ajouterResultat(id, resultat, compteRendu, request);
        return ResponseEntity.ok(res);
    }


    @GetMapping("/dossiers/{id}/resultat")
    public ResponseEntity<ResultatDossier> getResultatByDossier(@PathVariable Long id, HttpServletRequest request) {
        ResultatDossier resultat = resultatService.getResultatByDossierId(id, request);
        if (resultat == null) {
            return ResponseEntity.noContent().build(); // 204 si pas trouvé
        }
        return ResponseEntity.ok(resultat);
    }




    @GetMapping("/dossiers/{id}/resultats")  // note le pluriel pour éviter la confusion
    public ResponseEntity<List<ResultatDossier>> getAllResultatsByDossier(@PathVariable Long id, HttpServletRequest request) {
        List<ResultatDossier> resultats = resultatService.getAllResultatsByDossierId(id, request);
        if (resultats == null || resultats.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(resultats);
    }



    // GET /api/resultats/mes-resultats : récupérer les résultats de l'utilisateur connecté
    @GetMapping("/mes-resultats")
    public ResponseEntity<List<ResultatDossier>> getMesResultats(HttpServletRequest request) {
        List<ResultatDossier> res = resultatService.getMesResultats(request);
        return ResponseEntity.ok(res);
    }

    // PUT /api/resultats/{id} : modifier un résultat (seulement si auteur)
    @PutMapping("/{id}")
    public ResponseEntity<ResultatDossier> updateResultat(
            @PathVariable Long id,
            @RequestParam String resultat,
            @RequestParam String compteRendu,
            HttpServletRequest request) {

        ResultatDossier res = resultatService.updateResultat(id, resultat, compteRendu, request);
        return ResponseEntity.ok(res);
    }

    // DELETE /api/resultats/{id} : supprimer un résultat (seulement si auteur)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResultat(@PathVariable Long id, HttpServletRequest request) {
        resultatService.deleteResultat(id, request);
        return ResponseEntity.noContent().build();
    }
}
