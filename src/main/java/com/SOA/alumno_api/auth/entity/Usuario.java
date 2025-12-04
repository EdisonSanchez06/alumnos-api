package com.soa.alumno_api.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Rol role;

    /**
     * Cedula del alumno asociado (si role = USER)
     * Si role = ADMIN, puede ser null
     */
    @Column(name = "cedula", length = 20)
    private String cedula;

    // ============================
    //  ROLE -> AUTHORITIES
    // ============================
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security espera "ROLE_ADMIN", "ROLE_SECRETARIA", etc.
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }


    // ============================
    //  USERDETAILS OVERRIDES
    // ============================

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
