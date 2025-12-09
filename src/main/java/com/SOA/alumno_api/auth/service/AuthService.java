package com.soa.alumno_api.auth.service;

import com.soa.alumno_api.auth.dto.RegisterRequest;
import com.soa.alumno_api.auth.entity.Rol;
import com.soa.alumno_api.auth.entity.Usuario;
import com.soa.alumno_api.auth.repo.UsuarioRepository;
import com.soa.alumno_api.alumno.repo.AlumnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final AlumnoRepository alumnoRepository;  // aunque no lo usemos ahora, se puede dejar
    private final PasswordEncoder passwordEncoder;

    /**
     * Registro de usuario (solo roles ADMIN o SECRETARIA)
     */
    public String register(RegisterRequest req) {

        // 1. Validar si ya existe username
        if (usuarioRepository.existsByUsername(req.getUsername())) {
            return "El usuario ya está registrado";
        }

        // 2. Validar rol
        if (req.getRole() == null || req.getRole().isBlank()) {
            return "Debe indicar el rol (ADMIN o SECRETARIA)";
        }

        // 3. Convertir rol a enum (solo ADMIN / SECRETARIA)
        Rol rol;
        try {
            rol = Rol.valueOf(req.getRole().toUpperCase());
        } catch (Exception e) {
            return "Rol inválido. Solo se permite ADMIN o SECRETARIA";
        }

        // 🔹 Si quisieras hacer alguna validación extra por rol,
        // aquí puedes usar: if (rol == Rol.SECRETARIA) { ... }

        // 4. Crear entidad usuario
        Usuario user = new Usuario();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword())); // BCrypt
        user.setRole(rol);
        user.setCedula(req.getCedula()); // opcional, puede ir null

        // 5. Guardar
        usuarioRepository.save(user);

        return "Usuario registrado correctamente";
    }
}
