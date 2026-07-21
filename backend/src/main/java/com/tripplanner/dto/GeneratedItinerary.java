package com.tripplanner.dto;

import java.util.List;

public record GeneratedItinerary(
        String resolvedDestination,
        List<HotelDto> hotels,
        List<DayPlanDto> days
) {}