package com.example.dossiers_service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class DossierService {

    private final DossierRepository dossierRepository;
    private final UserServiceClient userServiceClient;

    private final AttachmentServiceClient attachmentServiceClient;
    @Autowired
    private DossierCME_LancementRepository lancementRepository;
    @Autowired
    private DossierCME_AttributionRepository attributionRepository;
    @Autowired
    private DossierCME_AvenantRepository avenantRepository;
    @Autowired
    private DossierCME_GreAGreRepository greAGreRepository;
    @Autowired
    private RestTemplate restTemplate; // 🔥 Pour appeler UserService & EmailService
    @Autowired
    private JwtUtil jwtUtil;
    private static final String USERSERVICE_URL = "http://localhost:8081/api/users/emails-cme";
    private static final String EMAILSERVICE_URL = "http://localhost:8082/email/send-email-attachment";

    private static final Set<String> EXTENSIONS_AUTORISEES = Set.of("pdf", "jpg", "png");
    private static final long TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

    @Transactional
    public DossierCME createDossier(String numeroDossier, String intitule, String typePassation,
                                    Double montantEstime, Double budgetEstime, Integer dureeContrat, Integer delaiRealisation,
                                    String nomFournisseur, Double montantContrat,
                                    MultipartFile[] files, List<String> fileNames, Long userId, String typefournisseur,boolean fournisseurEtrangerInstallationPermanente,
                                    boolean originePaysNonDoubleImposition,   String numeroContrat,String dateExpirationContrat,String typologidemarche, String garantie, Integer experiencefournisseur,
                                    Integer nombredeprojetssimilaires,
                                    Integer notationinterne,
                                    Integer chiffreaffaire,
                                    String situationfiscale,
                                    String fournisseurblacklist,
                                    String dateSignatureContrat,String objetAvenant,
                                    Double montantAvenant,
                                    Integer dureeAvenant,Double nouveauMontantContrat,Integer nouvelleDureeContrat,
                                    HttpServletRequest request) {

        // 🟢 Ajout du request

        // 🔹 Récupérer le JWT depuis le cookie
        String jwtToken = extractJwtFromRequest(request);
        if (jwtToken == null) {
            throw new IllegalArgumentException("❌ Token JWT non trouvé !");
        }

        // 🔹 Vérifier si l'utilisateur est un CHARGE_DOSSIERS
        UserDTO utilisateur = userServiceClient.getUserById(userId, "jwt=" + jwtToken);


        // 🔹 Création du dossier
        DossierCME dossier = new DossierCME();
        dossier.setNumeroDossier(numeroDossier);
        dossier.setIntitule(intitule);
        dossier.setTypePassation(TypePassation.valueOf(typePassation));
        dossier.setChargeDossierId(userId);
        dossier = dossierRepository.save(dossier);
        // Gérer les types de passation et associer l'entité correspondante
        switch (dossier.getTypePassation()) {
            case APPEL_OFFRE_LANCEMENT:
            case Consultation_Prestataire_de_Lancement:
            case Consultation_Procurement_de_Lancement:

                // Créez l'entité avec les données fournies par l'utilisateur
                DossierCME_Lancement lancement = new DossierCME_Lancement();
                lancement.setDossier(dossier);
                lancement.setMontantEstime(montantEstime);
                lancement.setBudgetEstime(budgetEstime);
                lancement.setDelaiRealisation(delaiRealisation);
                lancement.setGarantie(garantie);
                lancement.setTypologidemarche(typologidemarche);
                lancementRepository.save(lancement);
                break;

            case APPEL_OFFRE_ATTRIBUTION:
            case Consultation_Prestataire_dAttribution:
            case Consultation_Procurement_dAttribution:


                DossierCME_Attribution attribution = new DossierCME_Attribution();
                attribution.setDossier(dossier);
                attribution.setNomFournisseur(nomFournisseur);
                attribution.setMontantContrat(montantContrat);
                attribution.setDureeContrat(dureeContrat);
                attribution.setDelaiRealisation(delaiRealisation);
                attribution.setTypologidemarche(typologidemarche);
                attribution.setGarantie(garantie);
                attribution.setExperiencefournisseur(experiencefournisseur);
                attribution.setNombredeprojetssimilaires(nombredeprojetssimilaires);
                attribution.setNotationinterne(notationinterne);
                attribution.setChiffreaffaire(chiffreaffaire);
                attribution.setSituationfiscale(situationfiscale);
                attribution.setFournisseurblacklist(fournisseurblacklist);
                attribution.setTypefournisseur(typefournisseur);
                attribution.setFournisseurEtrangerInstallationPermanente(fournisseurEtrangerInstallationPermanente);
                attribution.setOriginePaysNonDoubleImposition(originePaysNonDoubleImposition);
                attributionRepository.save(attribution);
                break;

            case GRE_A_GRE:

                DossierCME_GreAGre greAGre = new DossierCME_GreAGre();
                greAGre.setDossier(dossier);
                greAGre.setMontantEstime(montantEstime);
                greAGre.setBudgetEstime(budgetEstime);
                greAGre.setDureeContrat(dureeContrat);
                greAGre.setDelaiRealisation(delaiRealisation);
                greAGreRepository.save(greAGre);
                break;

            case AVENANT:


                DossierCME_Avenant avenant = new DossierCME_Avenant();
                avenant.setDossier(dossier);
                avenant.setNumeroContrat(numeroContrat);
                avenant.setDateSignatureContrat(dateSignatureContrat);
                avenant.setDureeContrat(dureeContrat);
                avenant.setDateExpirationContrat(dateExpirationContrat);
                avenant.setMontantContrat(montantContrat);
                avenant.setObjetAvenant(objetAvenant);
                avenant.setMontantAvenant(montantAvenant);
                avenant.setDureeAvenant(dureeAvenant);
                avenant.setNouveauMontantContrat(montantAvenant+montantContrat);
                avenant.setNouvelleDureeContrat(dureeContrat+dureeAvenant);
                avenantRepository.save(avenant);
                break;
            case RECOURS:
                break;
            default:
                throw new IllegalArgumentException("❌ Type de passation inconnu !");
        }

        log.info("✅ Dossier créé par {} (ID: {}), Numéro: {}", utilisateur.getName(), userId, dossier.getNumeroDossier());

        // 🔹 Vérification si des fichiers sont envoyés
        if (files != null && files.length > 0) {
            if (fileNames == null || fileNames.size() != files.length) {
                throw new IllegalArgumentException("Le nombre de fichiers et de noms doit être identique !");
            }

            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                String fileName = fileNames.get(i);

                try {
                    validerFichier(file);

                    // 🔹 Upload du fichier et obtenir le fileId
                    String fileId = attachmentServiceClient.uploadFile(file, "DossierCME", dossier.getId());

                    if (fileId.startsWith("{")) {
                        fileId = extractFileIdFromJson(fileId); // méthode pour extraire uniquement l'ID
                    }

                    // 🔹 Ajouter le fileId et son nom dans la Map
                    dossier.getFileDetails().put(fileName, fileId);

                    log.info("📂 Fichier '{}' (ID: {}) ajouté au dossier {}", fileName, fileId, dossier.getId());
                } catch (IOException e) {
                    log.error("❌ Erreur lors de l'upload du fichier '{}': {}", fileName, e.getMessage());
                }
            }

            dossier = dossierRepository.save(dossier);
            // 🔹 Envoyer un email aux membres CME
            try {
                // Récupérer les emails des membres CME depuis UserService
                HttpHeaders headers = new HttpHeaders();
                headers.set("Cookie", "jwt=" + jwtToken); // JWT pour l'autorisation
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                ResponseEntity<List<String>> response = restTemplate.exchange(
                        USERSERVICE_URL,
                        HttpMethod.GET,
                        entity,
                        new ParameterizedTypeReference<List<String>>() {}
                );

                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    List<String> emailsCME = response.getBody();
                    emailsCME.add(utilisateur.getEmail()); // Ajouter l'email du créateur si nécessaire

                    // Si des emails sont disponibles, envoyer un email
                    if (!emailsCME.isEmpty()) {
                        MultiValueMap<String, String> emailRequest = new LinkedMultiValueMap<>();
                        emailRequest.add("to", String.join(",", emailsCME)); // Liste des emails
                        emailRequest.add("subject", "🔔 Nouveau dossier à traiter");
                        emailRequest.add("text", "Un nouveau dossier (Numéro : " + numeroDossier + ") a été ajouté et doit être traité.");

                        HttpHeaders emailHeaders = new HttpHeaders();
                        emailHeaders.set("Cookie", "jwt=" + jwtToken); // JWT pour EmailService
                        emailHeaders.setContentType(MediaType.MULTIPART_FORM_DATA);

                        HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(emailRequest, emailHeaders);

                        ResponseEntity<String> emailResponse = restTemplate.postForEntity(EMAILSERVICE_URL, requestEntity, String.class);

                        if (emailResponse.getStatusCode() == HttpStatus.OK) {
                            log.info("✅ Email envoyé avec succès aux membres CME !");
                        } else {
                            log.error("❌ Erreur lors de l'envoi de l'email : {}", emailResponse.getBody());
                        }
                    }
                }
            } catch (Exception e) {
                log.error("❌ Erreur lors de l'envoi d'email aux membres CME : {}", e.getMessage());
            }

        }

        return dossier;
    }


    private String extractJwtFromRequest(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void validerFichier(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.contains(".")) {
            throw new IOException("❌ Fichier sans extension !");
        }
        String extension = filename.substring(filename.lastIndexOf(".") + 1);

        if (!EXTENSIONS_AUTORISEES.contains(extension.toLowerCase())) {
            throw new IOException("❌ Type de fichier non autorisé !");
        }
        if (file.getSize() > TAILLE_MAX) {
            throw new IOException("❌ Taille du fichier trop grande !");
        }

    }
    private String extractFileIdFromJson(String jsonResponse) {
        return jsonResponse.substring(jsonResponse.indexOf(":") + 1, jsonResponse.indexOf("}")).trim();
    }
    @Transactional(readOnly = true)
    public List<DossierCME> getAllDossiers() {
        return dossierRepository.findAll();
    }
    @Transactional(readOnly = true)
    public Map<String, Object> getCompleteDossierById(Long dossierId, HttpServletRequest request) {
        // Récupérer le dossier principal
        DossierCME dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new IllegalArgumentException("❌ Dossier introuvable avec l'ID : " + dossierId));

        // Récupérer les informations de l'utilisateur responsable
        String jwtToken = extractJwtFromRequest(request);
        UserDTO chargeDossier = userServiceClient.getUserById(dossier.getChargeDossierId(), "jwt=" + jwtToken);

        // Créer une réponse enrichie
        Map<String, Object> response = new HashMap<>();
        response.put("fileDetails", enrichFileDetails(dossier.getFileDetails())); // Ajouter les fichiers avec leurs URLs
        response.put("chargeDossier", chargeDossier);

        // Ajouter uniquement les informations de base du dossier, sans "lancement", "avenant", etc.
        Map<String, Object> dossierMinimal = new HashMap<>();
        dossierMinimal.put("id", dossier.getId());
        dossierMinimal.put("numeroDossier", dossier.getNumeroDossier());
        dossierMinimal.put("intitule", dossier.getIntitule());
        dossierMinimal.put("etat", dossier.getEtat());
        dossierMinimal.put("typePassation", dossier.getTypePassation());
        dossierMinimal.put("dateSoumission", dossier.getDateSoumission());
        dossierMinimal.put("chargeDossierId", dossier.getChargeDossierId());
        dossierMinimal.put("fileDetails", dossier.getFileDetails());

        response.put("dossier", dossierMinimal);

        // Ajouter les détails spécifiques selon le type de passation
        switch (dossier.getTypePassation()) {
            case APPEL_OFFRE_LANCEMENT:
            case Consultation_Prestataire_de_Lancement:
            case Consultation_Procurement_de_Lancement:
                DossierCME_Lancement lancement = lancementRepository.findByDossier(dossier)
                        .orElseThrow(() -> new IllegalArgumentException("❌ Lancement introuvable pour ce dossier."));
                response.put("details", lancement);
                break;

            case GRE_A_GRE:
                DossierCME_GreAGre greAGre = greAGreRepository.findByDossier(dossier)
                        .orElseThrow(() -> new IllegalArgumentException("❌ Gré à gré introuvable pour ce dossier."));
                response.put("details", greAGre);
                break;

            case AVENANT:
                DossierCME_Avenant avenant = avenantRepository.findByDossier(dossier)
                        .orElseThrow(() -> new IllegalArgumentException("❌ Avenant introuvable pour ce dossier."));
                response.put("details", avenant);
                break;

            case APPEL_OFFRE_ATTRIBUTION:
            case Consultation_Prestataire_dAttribution:
            case Consultation_Procurement_dAttribution:
                DossierCME_Attribution attribution = attributionRepository.findByDossier(dossier)
                        .orElseThrow(() -> new IllegalArgumentException("❌ Attribution introuvable pour ce dossier."));
                response.put("details", attribution);
                break;
            case RECOURS:
                break;

            default:
                throw new IllegalArgumentException("❌ Type de passation inconnu : " + dossier.getTypePassation());
        }

        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDossiersByType(TypePassation typePassation, HttpServletRequest request) {
        // Récupérer le JWT depuis la requête
        String jwtToken = extractJwtFromRequest(request);

        // Récupérer l'utilisateur connecté via son ID dans le JWT
        Long userId = jwtUtil.extractUserId(jwtToken);

        // Récupérer tous les dossiers correspondant au type donné
        List<DossierCME> dossiers = dossierRepository.findByTypePassation(typePassation);

        // Créer une réponse enrichie
        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> dossiersEnriched = new ArrayList<>();

        for (DossierCME dossier : dossiers) {
            if (!dossier.getChargeDossierId().equals(userId)) {
                // Ignorer les dossiers non liés à l'utilisateur connecté
                continue;
            }

            // Enrichir chaque dossier avec les informations nécessaires
            UserDTO chargeDossier = userServiceClient.getUserById(dossier.getChargeDossierId(), "jwt=" + jwtToken);
            Map<String, Object> dossierDetails = new HashMap<>();
            dossierDetails.put("id", dossier.getId());
            dossierDetails.put("numeroDossier", dossier.getNumeroDossier());
            dossierDetails.put("intitule", dossier.getIntitule());
            dossierDetails.put("etat", dossier.getEtat());
            dossierDetails.put("typePassation", dossier.getTypePassation());
            dossierDetails.put("dateSoumission", dossier.getDateSoumission());
            dossierDetails.put("chargeDossier", chargeDossier);
            dossierDetails.put("fileDetails", enrichFileDetails(dossier.getFileDetails()));

            // Ajouter les détails spécifiques selon le type de passation
            switch (dossier.getTypePassation()) {
                case APPEL_OFFRE_LANCEMENT:
                case Consultation_Prestataire_de_Lancement:
                case Consultation_Procurement_de_Lancement:
                    DossierCME_Lancement lancement = lancementRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Lancement introuvable pour ce dossier."));
                    dossierDetails.put("details", lancement);
                    break;

                case GRE_A_GRE:
                    DossierCME_GreAGre greAGre = greAGreRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Gré à gré introuvable pour ce dossier."));
                    dossierDetails.put("details", greAGre);
                    break;

                case AVENANT:
                    DossierCME_Avenant avenant = avenantRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Avenant introuvable pour ce dossier."));
                    dossierDetails.put("details", avenant);
                    break;

                case APPEL_OFFRE_ATTRIBUTION:
                case Consultation_Prestataire_dAttribution:
                case Consultation_Procurement_dAttribution:
                    DossierCME_Attribution attribution = attributionRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Attribution introuvable pour ce dossier."));
                    dossierDetails.put("details", attribution);
                    break;
                case RECOURS:
                    break;

                default:
                    dossierDetails.put("details", "Aucun détail supplémentaire disponible pour ce type de passation.");
            }

            // Ajouter le dossier enrichi à la liste
            dossiersEnriched.add(dossierDetails);
        }

        response.put("dossiers", dossiersEnriched);
        response.put("type", typePassation);

        return response;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDossiersByTypeOnly(TypePassation typePassation, HttpServletRequest request) {
        // Récupérer tous les dossiers du type donné
        List<DossierCME> dossiers = dossierRepository.findByTypePassation(typePassation);
// Récupérer le JWT depuis la requête
        String jwtToken = extractJwtFromRequest(request);
        // Vérifier si la liste des dossiers est vide
        if (dossiers == null || dossiers.isEmpty()) {
            return Collections.emptyList(); // Retourne une liste vide si aucun dossier n'est trouvé
        }

        // Enrichir chaque dossier avec les informations nécessaires
        List<Map<String, Object>> dossiersEnriched = new ArrayList<>();
        for (DossierCME dossier : dossiers) {
            UserDTO chargeDossier = userServiceClient.getUserById(dossier.getChargeDossierId(), "jwt=" + jwtToken);
            Map<String, Object> dossierDetails = new HashMap<>();

            // Assurer que les champs sont non nuls
            dossierDetails.put("id", dossier.getId() != null ? dossier.getId() : "Inconnu");
            dossierDetails.put("numeroDossier", dossier.getNumeroDossier() != null ? dossier.getNumeroDossier() : "Non renseigné");
            dossierDetails.put("intitule", dossier.getIntitule() != null ? dossier.getIntitule() : "Non précisé");
            dossierDetails.put("etat", dossier.getEtat() != null ? dossier.getEtat() : "État inconnu");
            dossierDetails.put("typePassation", dossier.getTypePassation() != null ? dossier.getTypePassation().toString() : "Non défini");
            dossierDetails.put("chargeDossier", chargeDossier);
            dossierDetails.put("dateSoumission", dossier.getDateSoumission() != null ? dossier.getDateSoumission() : "Date inconnue");

            // Enrichir les détails des fichiers
            if (dossier.getFileDetails() != null) {
                dossierDetails.put("fileDetails", enrichFileDetails(dossier.getFileDetails()));
            } else {
                dossierDetails.put("fileDetails", "Aucun fichier disponible");
            }


            // Ajouter les détails spécifiques selon le type de passation
            switch (dossier.getTypePassation()) {
                case APPEL_OFFRE_LANCEMENT:
                case Consultation_Prestataire_de_Lancement:
                case Consultation_Procurement_de_Lancement:
                    DossierCME_Lancement lancement = lancementRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Lancement introuvable pour ce dossier."));
                    dossierDetails.put("details", lancement);
                    break;

                case GRE_A_GRE:
                    DossierCME_GreAGre greAGre = greAGreRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Gré à gré introuvable pour ce dossier."));
                    dossierDetails.put("details", greAGre);
                    break;

                case AVENANT:
                    DossierCME_Avenant avenant = avenantRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Avenant introuvable pour ce dossier."));
                    dossierDetails.put("details", avenant);
                    break;

                case APPEL_OFFRE_ATTRIBUTION:
                case Consultation_Prestataire_dAttribution:
                case Consultation_Procurement_dAttribution:
                    DossierCME_Attribution attribution = attributionRepository.findByDossier(dossier)
                            .orElseThrow(() -> new IllegalArgumentException("❌ Attribution introuvable pour ce dossier."));
                    dossierDetails.put("details", attribution);
                    break;
                case RECOURS:
                    break;

                default:
                    dossierDetails.put("details", "Aucun détail supplémentaire disponible pour ce type de passation.");
            }

            // Ajouter le dossier enrichi à la liste
            dossiersEnriched.add(dossierDetails);
        }

        return dossiersEnriched;
    }



    public Map<String, String> enrichFileDetails(Map<String, String> fileDetails) {
        Map<String, String> fileDetailsWithUrls = new HashMap<>();
        for (Map.Entry<String, String> entry : fileDetails.entrySet()) {
            String fileName = entry.getKey();
            String fileId = entry.getValue();
            // Générez l'URL du fichier en fonction de son ID
            String fileUrl = "http://localhost:8083/api/attachments/view/" + fileId;
            fileDetailsWithUrls.put(fileName, fileUrl);
        }
        return fileDetailsWithUrls;
    }


    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllCompleteDossiers(HttpServletRequest request) {
        List<DossierCME> dossiers = dossierRepository.findAll();
        String jwtToken = extractJwt(request);

        List<Map<String, Object>> enrichedDossiers = new ArrayList<>();

        for (DossierCME dossier : dossiers) {
            // 🔹 Retrieve user details
            UserDTO chargeDossier = userServiceClient.getUserById(dossier.getChargeDossierId(), "jwt=" + jwtToken);

            // 🔹 Enrich fileDetails with URLs
            Map<String, String> fileDetailsWithUrls = new HashMap<>();
            for (Map.Entry<String, String> entry : dossier.getFileDetails().entrySet()) {
                String fileName = entry.getKey();
                String fileId = entry.getValue();
                String fileUrl = "http://localhost:8083/api/attachments/view/" + fileId;
                fileDetailsWithUrls.put(fileName, fileUrl);
            }

            // 🔹 Build dossier response
            Map<String, Object> dossierResponse = new HashMap<>();
            dossierResponse.put("dossier", dossier);
            dossierResponse.put("chargeDossier", chargeDossier);
            dossierResponse.put("fileDetails", fileDetailsWithUrls);
            dossierResponse.put("resultats", chargeDossier);

            enrichedDossiers.add(dossierResponse);
        }

        return enrichedDossiers;
    }
    public List<DossierCME> getDossiersByConnectedUser(HttpServletRequest request) {
        // Extraire l'ID de l'utilisateur connecté à partir du JWT
        String jwtToken = extractJwtFromRequest(request);
        Long userId = jwtUtil.extractUserId(jwtToken);

        if (userId == null) {
            throw new IllegalArgumentException("Impossible d'extraire l'ID utilisateur !");
        }

        // Récupérer les dossiers créés par cet utilisateur
        return dossierRepository.findByChargeDossierId(userId);
    }



    public DossierCME updateDossier(
            Long dossierId,
            String numeroDossier,
            String intitule,
            String typePassation,
            Double montantEstime,
            Double budgetEstime,
            Integer dureeContrat,
            Integer delaiRealisation,
            String nomFournisseur,
            Double montantContrat,
            String typefournisseur,
            Boolean fournisseurEtrangerInstallationPermanente,
            Boolean originePaysNonDoubleImposition,
            String numeroContrat,
            String dateExpirationContrat,
            String typologidemarche,
            String garantie ,
            Integer experiencefournisseur,
            Integer nombredeprojetssimilaires,
            Integer notationinterne,
            Integer chiffreaffaire,
            String situationfiscale,
            String fournisseurblacklist,
            String dateSignatureContrat,
            String objetAvenant,
            Double montantAvenant,
            Integer dureeAvenant,

            HttpServletRequest request) {

        // Récupérer le dossier existant
        DossierCME dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new IllegalArgumentException("❌ Dossier introuvable avec l'ID : " + dossierId));

        // Mettre à jour les champs communs du dossier
        if (numeroDossier != null) dossier.setNumeroDossier(numeroDossier);
        if (intitule != null) dossier.setIntitule(intitule);
        if (typePassation != null) dossier.setTypePassation(TypePassation.valueOf(typePassation));

        // Gestion spécifique selon le type de passation
        switch (dossier.getTypePassation()) {
            case APPEL_OFFRE_LANCEMENT:
            case Consultation_Prestataire_de_Lancement:
            case Consultation_Procurement_de_Lancement:
                DossierCME_Lancement lancement = lancementRepository.findByDossier(dossier)
                        .orElseGet(() -> new DossierCME_Lancement()); // Créer une nouvelle entité si elle n'existe pas
                lancement.setDossier(dossier);
                if (montantEstime != null) lancement.setMontantEstime(montantEstime);
                if (budgetEstime != null) lancement.setBudgetEstime(budgetEstime);
                if (delaiRealisation != null) lancement.setDelaiRealisation(delaiRealisation);
                if (garantie != null) lancement.setGarantie(garantie);
                if (typologidemarche != null) lancement.setTypologidemarche(typologidemarche);

                lancementRepository.save(lancement);
                break;

            case APPEL_OFFRE_ATTRIBUTION:
            case Consultation_Prestataire_dAttribution:
            case Consultation_Procurement_dAttribution:
                DossierCME_Attribution attribution = attributionRepository.findByDossier(dossier)
                        .orElseGet(() -> new DossierCME_Attribution());
                attribution.setDossier(dossier);
                if (nomFournisseur != null) attribution.setNomFournisseur(nomFournisseur);
                if (montantContrat != null) attribution.setMontantContrat(montantContrat);
                if (dureeContrat != null) attribution.setDureeContrat(dureeContrat);
                if (delaiRealisation != null) attribution.setDelaiRealisation(delaiRealisation);
                if (typologidemarche != null) attribution.setTypologidemarche(typologidemarche);
                if (garantie != null) attribution.setGarantie(garantie);
                if (experiencefournisseur != null) attribution.setExperiencefournisseur(experiencefournisseur);
                if (nombredeprojetssimilaires != null) attribution.setNombredeprojetssimilaires(nombredeprojetssimilaires);
                if (notationinterne != null) attribution.setNotationinterne(notationinterne);
                if (chiffreaffaire != null) attribution.setChiffreaffaire(chiffreaffaire);
                if (situationfiscale != null)  attribution.setSituationfiscale(situationfiscale);
                if (fournisseurblacklist != null) attribution.setFournisseurblacklist(fournisseurblacklist);

                if (typefournisseur != null) attribution.setTypefournisseur(typefournisseur);
                if (fournisseurEtrangerInstallationPermanente != null) attribution.setFournisseurEtrangerInstallationPermanente(fournisseurEtrangerInstallationPermanente);
                if (originePaysNonDoubleImposition != null) attribution.setOriginePaysNonDoubleImposition(originePaysNonDoubleImposition);







                attributionRepository.save(attribution);
                break;

            case GRE_A_GRE:
                DossierCME_GreAGre greAGre = greAGreRepository.findByDossier(dossier)
                        .orElseGet(() -> new DossierCME_GreAGre());
                greAGre.setDossier(dossier);
                if (montantEstime != null) greAGre.setMontantEstime(montantEstime);
                if (budgetEstime != null) greAGre.setBudgetEstime(budgetEstime);
                if (dureeContrat != null) greAGre.setDureeContrat(dureeContrat);
                if (delaiRealisation != null) greAGre.setDelaiRealisation(delaiRealisation);
                greAGreRepository.save(greAGre);
                break;

            case AVENANT:
                DossierCME_Avenant avenant = avenantRepository.findByDossier(dossier)
                        .orElseGet(() -> new DossierCME_Avenant());
                avenant.setDossier(dossier);
                if (numeroContrat != null) avenant.setNumeroContrat(numeroContrat);
                if (dateSignatureContrat != null) avenant.setDateSignatureContrat(dateSignatureContrat);
                if (dureeContrat != null) avenant.setDureeContrat(dureeContrat);
                if (dateExpirationContrat != null) avenant.setDateExpirationContrat(dateExpirationContrat);
                if (montantContrat != null) avenant.setMontantContrat(montantContrat);
                if (objetAvenant != null) avenant.setObjetAvenant(objetAvenant);
                if (montantAvenant != null) avenant.setMontantAvenant(montantAvenant);
                if (dureeAvenant != null) avenant.setDureeAvenant(dureeAvenant);
                if (montantAvenant != null && montantContrat != null) avenant.setNouveauMontantContrat(montantAvenant + montantContrat);
                if (dureeContrat != null && dureeAvenant != null) avenant.setNouvelleDureeContrat(dureeContrat + dureeAvenant);
                avenantRepository.save(avenant);
                break;
            case RECOURS:
                break;

            default:
                throw new IllegalArgumentException("❌ Type de passation inconnu !");
        }

        // Sauvegarder le dossier
        return dossierRepository.save(dossier);
    }
    public void deleteDossier(Long dossierId, HttpServletRequest request) {
        // Récupérer le dossier
        DossierCME dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new IllegalArgumentException("❌ Dossier introuvable avec l'ID : " + dossierId));

        // Vérifier si l'utilisateur connecté est le chargé de dossier
        String jwtToken = JwtUtil.extractTokenFromCookie(request);
        Long connectedUserId = jwtUtil.extractUserId(jwtToken);
        if (!connectedUserId.equals(dossier.getChargeDossierId())) {
            throw new IllegalArgumentException("⚠️ Vous n'êtes pas le chargé de ce dossier, vous ne pouvez pas le supprimer !");
        }

        // Vérifier l'état du dossier avant la suppression
        if (!"EN_ATTENTE".equalsIgnoreCase(dossier.getEtat().toString().trim())) {
            throw new IllegalArgumentException("⚠️ Ce dossier est en cours de traitement, vous ne pouvez pas le supprimer !");
        }

        // Supprimer les relations liées
        if (dossier.getLancement() != null) {
            lancementRepository.delete(dossier.getLancement());
        }
        if (dossier.getGreAGre() != null) {
            greAGreRepository.delete(dossier.getGreAGre());
        }
        if (dossier.getAvenant() != null) {
            avenantRepository.delete(dossier.getAvenant());
        }
        if (dossier.getAttribution() != null) {
            attributionRepository.delete(dossier.getAttribution());
        }

        // Supprimer le dossier principal
        dossierRepository.delete(dossier);
    }


    private String extractJwt(HttpServletRequest request) {
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }


    public Map<String, Long> getStatistiquesParEtat() {
        List<Object[]> results = dossierRepository.countDossiersByEtat();

        Map<String, Long> stats = new HashMap<>();
        for (Object[] result : results) {
            EtatDossier etat = (EtatDossier) result[0];
            Long count = (Long) result[1];
            stats.put(etat.name(), count);
        }

        return stats;
    }

public DossierCME changerEtat(Long id, EtatDossier nouvelEtat) {
        DossierCME dossier = dossierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dossier non trouvé"));

        dossier.setEtat(nouvelEtat);

        return dossierRepository.save(dossier);
    }
    @Transactional(readOnly = true)
    public Map<String, Long> getStatsEtatByUser(HttpServletRequest request) {
        // Extraire le JWT
        String jwt = extractJwtFromRequest(request);
        Long userId = jwtUtil.extractUserId(jwt);

        // Récupérer tous les dossiers créés par cet utilisateur
        List<DossierCME> dossiers = dossierRepository.findByChargeDossierId(userId);

        // Compter les dossiers par état
        return dossiers.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.groupingBy(
                        dossier -> dossier.getEtat().name(),
                        Collectors.counting()
                ));
    }

}
