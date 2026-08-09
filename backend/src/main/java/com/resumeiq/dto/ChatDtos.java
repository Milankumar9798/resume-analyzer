package com.resumeiq.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public class ChatDtos {

    public record ChatRequest(
            @NotBlank String message
    ) {}

    public record ChatMessageResponse(
            UUID id,
            String role,
            String content,
            Instant createdAt
    ) {}
}
