package com.tripplanner.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record HotelDto(
        String name,
        String address,
        String pricePerNight,
        Double rating,
        String imageQuery,
        String imageUrl
) {
    public HotelDto withImageUrl(String url) {
        return new HotelDto(name, address, pricePerNight, rating, imageQuery, url);
    }
}
