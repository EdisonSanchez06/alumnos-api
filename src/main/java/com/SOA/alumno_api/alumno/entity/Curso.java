package com.soa.alumno_api.alumno.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "cursos")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String nivel;
    private String paralelo;

    @OneToMany(mappedBy = "curso")
    @JsonIgnore // evita ciclos infinitos al devolver JSON
    private List<Alumno> alumnos;
}
