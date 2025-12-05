package com.soa.alumno_api.auth.service;

import com.soa.alumno_api.auth.entity.Usuario;
import com.soa.alumno_api.auth.repo.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
@Service
@RequiredArgsConstructor
public class JpaUserDetailsService implements UserDetailsService {

    private final UsuarioRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Usuario u = repo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("No existe el usuario"));

        return User.builder()
                .username(u.getUsername())
                .password(u.getPassword())
                .roles(u.getRole().name()) // genera ROLE_ADMIN o ROLE_SECRETARIA
                .build();
    }
}
