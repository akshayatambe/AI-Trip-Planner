package com.tripplanner.dto;

import com.tripplanner.model.User;

import java.time.Instant;

public record UserResponse(
        Long id,
        String name,
        String email,
        String pictureUrl,
        String authProvider,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPictureUrl(),
                user.getAuthProvider(),
                user.getCreatedAt()
        );
    }
}