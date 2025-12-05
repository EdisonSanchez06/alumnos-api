package com.soa.alumno_api.alumno.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "cursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    /**
     * Importante:
     * - EAGER → resuelve LazyInitializationException
     * - referencedColumnName debe usar el nombre EXACTO de la columna
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "est_ced", referencedColumnName = "EST_CED", nullable = false)
    @JsonIgnoreProperties({"cursos"}) // Evita recursión
    private Alumno alumno;
}
