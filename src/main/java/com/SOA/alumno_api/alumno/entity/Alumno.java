package com.soa.alumno_api.alumno.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name = "alumnos")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Alumno {

    @Id
    @Column(length = 10)
    private String estCed;

    @Column(nullable = false)
    private String estNom;

    @Column(nullable = false)
    private String estApe;

    @Column(nullable = false)
    private String estDir;

    @Column(nullable = false, length = 10)
    private String estTel;

    // MUCHOS alumnos → UN curso
    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso;
}
