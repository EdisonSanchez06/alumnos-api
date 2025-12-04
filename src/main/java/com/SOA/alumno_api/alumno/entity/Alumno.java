package com.soa.alumno_api.alumno.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "alumnos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alumno {

    @Id
    @Column(name = "EST_CED", length = 20)
    private String estCed;

    @Column(name = "est_nom", nullable = false, length = 100)
    private String estNom;

    @Column(name = "est_ape", nullable = false, length = 100)
    private String estApe;

    @Column(name = "est_dir", nullable = false, length = 150)
    private String estDir;

    @Column(name = "est_tel", nullable = false, length = 20)
    private String estTel;

    @JsonIgnore // evita recursión infinita al serializar JSON
    @OneToMany(mappedBy = "alumno", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Curso> cursos = new ArrayList<>();
}
