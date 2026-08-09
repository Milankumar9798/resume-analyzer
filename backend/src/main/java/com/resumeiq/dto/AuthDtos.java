package com.resumeiq.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(min = 2, max = 100) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8) String password
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record UpdateProfileRequest(
            @Size(min = 2, max = 100) String name,
            @Size(max = 150) String headline
    ) {}

    public record UserResponse(
            UUID id,
            String name,
            String email,
            String role,
            String headline,
            String avatarInitials,
            Instant createdAt
    ) {}

    public record AuthResponse(
            UserResponse user,
            String token
    ) {}
}
