package com.example.dossiers_service;


import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/passations")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@Slf4j
public class PassationController {

    public PassationController() {
        log.info("✅ PassationController chargé !");
    }

    @GetMapping
    public List<String> getAllPassations() {
        log.info("🔹 Récupération des types de passation...");
        return Arrays.stream(TypePassation.values())
                .map(Enum::name)
                .toList();
    }
}