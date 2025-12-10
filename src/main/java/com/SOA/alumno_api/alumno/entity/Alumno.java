package com.soa.alumno_api.alumno.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alumnos")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Alumno {

    @Id
    @Column(name = "est_ced")
    private String estCed;

    private String estNom;
    private String estApe;
    private String estTel;
    private String estDir;

    @ManyToOne
    @JoinColumn(name = "curso_id")
    private Curso curso; // alumno pertenece a un curso
}
