package com.example.dossiers_service;

import lombok.Data;

import java.util.HashSet;
import java.util.Set;
@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Set<RoleDTO> roles; // On récupère seulement les noms des rôles
}
@Data
class RoleDTO {
    private Long id;
    private String name;
    private Set<PermissionDTO> permissions = new HashSet<>();// Permissions associées à chaque rôle
}

@Data
class PermissionDTO {
    private Long id;
    private String name; // Nom de la permission
}