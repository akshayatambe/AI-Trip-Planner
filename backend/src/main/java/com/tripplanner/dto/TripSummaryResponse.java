package com.tripplanner.dto;

import com.tripplanner.model.BudgetLevel;
import com.tripplanner.model.TravelCompanion;
import com.tripplanner.model.Trip;

import java.time.Instant;

public record TripSummaryResponse(
        Long id,
        String destination,
        Integer days,
        BudgetLevel budget,
        TravelCompanion travelWith,
        String heroImageUrl,
        Instant createdAt
) {
    public static TripSummaryResponse from(Trip trip) {
        return new TripSummaryResponse(
                trip.getId(),
                trip.getDestination(),
                trip.getDays(),
                trip.getBudget(),
                trip.getTravelWith(),
                trip.getHeroImageUrl(),
                trip.getCreatedAt()
        );
    }
}
