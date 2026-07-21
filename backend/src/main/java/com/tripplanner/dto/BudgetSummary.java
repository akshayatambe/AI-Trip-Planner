package com.tripplanner.dto;

public record BudgetSummary(
        double estimatedActivitiesCost,
        double estimatedHotelCostPerNight,
        double estimatedHotelTotal,
        double estimatedGrandTotal,
        String note
) {
}