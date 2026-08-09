package com.resumeiq.dto;

import java.time.Instant;
import java.util.List;

public class DashboardDtos {

    public record Totals(long totalResumes, long totalAnalyses, long totalJobMatches) {}

    public record Averages(int avgAtsScore, int avgJobMatchScore) {}

    public record ScorePoint(Instant date, Integer score, String label) {}

    public record Trends(List<ScorePoint> atsScoreHistory, List<ScorePoint> jobMatchScoreHistory) {}

    public record DashboardResponse(
            Totals totals,
            Averages averages,
            Trends trends,
            List<ResumeDtos.ResumeResponse> recentResumes
    ) {}
}
