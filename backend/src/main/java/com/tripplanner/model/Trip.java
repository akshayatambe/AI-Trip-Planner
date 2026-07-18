package com.tripplanner.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private Integer days;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetLevel budget;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TravelCompanion travelWith;

    private String heroImageUrl;

    /** Full itinerary (hotels + day-by-day plan) serialized as JSON text. */
    @Lob
    @Column(columnDefinition = "CLOB")
    private String itineraryJson;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
