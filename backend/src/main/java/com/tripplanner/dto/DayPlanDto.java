package com.tripplanner.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record DayPlanDto(
        Integer dayNumber,
        ActivityDto morning,
        ActivityDto afternoon,
        ActivityDto evening
) {
}
