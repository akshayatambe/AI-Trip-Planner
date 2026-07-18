package com.tripplanner.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ActivityDto(
        String startTime,
        String endTime,
        String title,
        String description,
        String ticketInfo,
        String imageQuery,
        String imageUrl
) {
    public ActivityDto withImageUrl(String url) {
        return new ActivityDto(startTime, endTime, title, description, ticketInfo, imageQuery, url);
    }
}
