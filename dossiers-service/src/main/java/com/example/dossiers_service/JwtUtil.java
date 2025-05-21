package com.example.dossiers_service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtUtil {

    private static final String SECRET = "5367566B59703373367639792F423F4528482B4D6251655468576D5A713474375367566B59703373367639792F423F4528482B4D6251655468576D5A71347437";
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject); // getSubject() contient souvent l'email
    }
    // Extraction du username (email)
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Extraction des permissions
    public List<String> extractPermissions(String token) {
        return extractClaim(token, claims -> claims.get("permissions", List.class));
    }

    // Extraction d'une revendication spécifique
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // Extraction de toutes les revendications
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Clé de signature du JWT
    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Validation du token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSignKey())
                    .build()
                    .parseClaimsJws(token);
            return true; // Token valide
        } catch (ExpiredJwtException e) {
            System.out.println("❌ Token expiré !");
        } catch (JwtException e) {
            System.out.println("❌ Token invalide !");
        }
        return false;
    }
    private static final String COOKIE_NAME = "jwt"; // Vérifie bien que c'est le bon nom

    public static String extractTokenFromCookie(HttpServletRequest request) {
        String cookieHeader = request.getHeader("Cookie"); // 🔹 Récupère l'en-tête "Cookie"

        if (cookieHeader != null) {
            for (String cookie : cookieHeader.split(";")) { // 🔹 Sépare les cookies si plusieurs
                cookie = cookie.trim(); // 🔹 Supprime les espaces inutiles
                if (cookie.startsWith(COOKIE_NAME + "=")) {
                    return cookie.substring((COOKIE_NAME + "=").length()); // 🔹 Récupère la valeur du token
                }
            }
        }
        return null; // 🔹 Retourne null si aucun cookie JWT n'est trouvé
    }


    // Extraction de l'ID utilisateur depuis le token
    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }


}
