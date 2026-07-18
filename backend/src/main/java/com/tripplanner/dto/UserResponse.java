package com.tripplanner.dto;

import com.tripplanner.model.User;

public record UserResponse(Long id, String name, String email, String pictureUrl) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPictureUrl());
    }
}
