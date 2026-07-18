package com.tripplanner.dto;

import com.tripplanner.model.BudgetLevel;
import com.tripplanner.model.TravelCompanion;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TripRequest(
        @NotBlank(message = "destination is required") String destination,
        @NotNull @Min(1) @Max(14) Integer days,
        @NotNull BudgetLevel budget,
        @NotNull TravelCompanion travelWith
) {
}
