package com.tripplanner.dto;

import java.util.List;

public record GeneratedItinerary(
        List<HotelDto> hotels,
        List<DayPlanDto> days
) {
}
