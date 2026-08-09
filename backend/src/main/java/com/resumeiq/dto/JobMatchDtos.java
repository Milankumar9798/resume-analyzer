package com.resumeiq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class JobMatchDtos {

    public record JobMatchRequest(
            @NotNull UUID resumeId,
            String jobTitle,
            String companyName,
            @NotBlank @Size(min = 50, message = "Paste the full job description for accurate matching")
            String jobDescription
    ) {}

    /** Shape Groq's JSON response must match. */
    public record JobMatchAiResult(
            Integer jobMatchScore,
            Integer skillsMatchScore,
            Integer keywordMatchScore,
            Integer experienceMatchScore,
            Integer educationMatchScore,
            Integer projectMatchScore,
            List<String> matchedSkills,
            List<String> missingSkills,
            List<String> matchedKeywords,
            List<String> missingKeywords,
            List<String> strengths,
            List<String> weaknesses,
            List<String> optimizationSuggestions,
            List<String> learningRoadmap,
            List<String> jobSpecificInterviewQuestions
    ) {}

    public record JobMatchResponse(
            UUID id,
            UUID resumeId,
            String resumeFileName,
            String jobTitle,
            String companyName,
            Integer jobMatchScore,
            Integer skillsMatchScore,
            Integer keywordMatchScore,
            Integer experienceMatchScore,
            Integer educationMatchScore,
            Integer projectMatchScore,
            List<String> matchedSkills,
            List<String> missingSkills,
            List<String> matchedKeywords,
            List<String> missingKeywords,
            List<String> strengths,
            List<String> weaknesses,
            List<String> optimizationSuggestions,
            List<String> learningRoadmap,
            List<String> jobSpecificInterviewQuestions,
            Instant createdAt
    ) {}

    public record JobMatchSummaryResponse(
            UUID id,
            String jobTitle,
            String companyName,
            Integer jobMatchScore,
            Instant createdAt
    ) {}
}
