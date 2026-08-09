package com.resumeiq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public class GeneratorDtos {

    public record CoverLetterRequest(
            @NotNull UUID resumeId,
            @NotBlank String companyName,
            @NotBlank String jobTitle,
            @NotBlank String jobDescription
    ) {}

    public record CoverLetterResponse(
            UUID id,
            String companyName,
            String jobTitle,
            String content,
            Instant createdAt
    ) {}

    public record LinkedInSummaryRequest(
            @NotNull UUID resumeId,
            String tone // "professional" | "conversational" | "confident" (optional, defaults to professional)
    ) {}

    public record LinkedInSummaryResponse(
            UUID id,
            String tone,
            String content,
            Instant createdAt
    ) {}
}
