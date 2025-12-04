package com.soa.alumno_api;

import com.soa.alumno_api.auth.entity.Rol;
import com.soa.alumno_api.auth.entity.Usuario;
import com.soa.alumno_api.auth.repo.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class AlumnosApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlumnosApiApplication.class, args);
    }

    @Bean
    CommandLineRunner initUsuarios(UsuarioRepository usuarioRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {

            // Si ya hay usuarios, no haré nada
            if (usuarioRepository.count() == 0) {
                System.out.println("⚙️  Creando usuarios iniciales...");

                // ADMIN
                Usuario admin = new Usuario();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123")); // BCrypt
                admin.setRole(Rol.ADMIN);
                admin.setCedula("0000000000"); // si tu entidad lo requiere
                usuarioRepository.save(admin);

                // SECRETARIA
                Usuario secre = new Usuario();
                secre.setUsername("secre");
                secre.setPassword(passwordEncoder.encode("secre123")); // BCrypt
                secre.setRole(Rol.SECRETARIA);
                secre.setCedula("1111111111"); // si tu entidad lo requiere
                usuarioRepository.save(secre);

                System.out.println("✔️ Usuarios creados correctamente");
            } else {
                System.out.println("ℹ️  Usuarios ya existen, no se creará nada");
            }
        };
    }
}
