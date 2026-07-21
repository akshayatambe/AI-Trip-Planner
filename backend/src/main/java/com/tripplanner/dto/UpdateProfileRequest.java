package com.tripplanner.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Name cannot be empty")
        @Size(max = 100, message = "Name must be under 100 characters")
        String name
) {
}