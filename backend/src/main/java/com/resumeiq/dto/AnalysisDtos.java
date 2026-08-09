package com.resumeiq.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AnalysisDtos {

    /** Shape Groq's JSON response must match - deserialized directly from the model output. */
    public record AnalysisAiResult(
            Integer atsScore,
            Integer grammarScore,
            Integer formattingScore,
            Integer resumeQualityScore,
            String summary,
            List<String> strengths,
            List<String> weaknesses,
            List<String> missingSkills,
            List<String> missingKeywords,
            List<String> improvementSuggestions,
            List<String> careerRecommendations,
            List<String> technicalInterviewQuestions,
            List<String> hrInterviewQuestions
    ) {}

    public record AnalysisResponse(
            UUID id,
            UUID resumeId,
            String resumeFileName,
            Integer atsScore,
            Integer grammarScore,
            Integer formattingScore,
            Integer resumeQualityScore,
            String summary,
            List<String> strengths,
            List<String> weaknesses,
            List<String> missingSkills,
            List<String> missingKeywords,
            List<String> improvementSuggestions,
            List<String> careerRecommendations,
            List<String> technicalInterviewQuestions,
            List<String> hrInterviewQuestions,
            Instant createdAt
    ) {}

    public record AnalysisSummaryResponse(
            UUID id,
            String resumeFileName,
            Integer atsScore,
            Instant createdAt
    ) {}
}
