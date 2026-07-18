package com.tripplanner.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String googleId;

    @Column(nullable = false, unique = true)
    private String email;

    private String name;

    private String pictureUrl;

    private String password;

    @Builder.Default
    private String authProvider = "GOOGLE";

    @Builder.Default
    private Instant createdAt = Instant.now();
}