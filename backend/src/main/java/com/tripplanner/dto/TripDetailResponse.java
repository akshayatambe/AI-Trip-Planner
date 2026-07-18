package com.tripplanner.dto;

import com.tripplanner.model.BudgetLevel;
import com.tripplanner.model.TravelCompanion;

import java.time.Instant;
import java.util.List;

public record TripDetailResponse(
        Long id,
        String destination,
        Integer days,
        BudgetLevel budget,
        TravelCompanion travelWith,
        String heroImageUrl,
        List<HotelDto> hotels,
        List<DayPlanDto> itinerary,
        Instant createdAt
) {
}
