package com.resumeiq.service;

import com.resumeiq.dto.DashboardDtos.*;
import com.resumeiq.model.Analysis;
import com.resumeiq.model.JobMatch;
import com.resumeiq.model.User;
import com.resumeiq.repository.AnalysisRepository;
import com.resumeiq.repository.JobMatchRepository;
import com.resumeiq.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ResumeRepository resumeRepository;
    private final AnalysisRepository analysisRepository;
    private final JobMatchRepository jobMatchRepository;
    private final ResumeService resumeService;
    private final AnalysisService analysisService;
    private final JobMatchService jobMatchService;

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public DashboardResponse getStats(User user) {
        long totalResumes = resumeRepository.countByUser(user);
        long totalAnalyses = analysisRepository.countByUser(user);
        long totalJobMatches = jobMatchRepository.countByUser(user);

        List<Analysis> recentAnalyses = analysisService.recentForUser(user, 10);
        List<JobMatch> recentMatches = jobMatchService.recentForUser(user, 10);

        int avgAts = recentAnalyses.isEmpty() ? 0 :
                (int) Math.round(recentAnalyses.stream().mapToInt(Analysis::getAtsScore).average().orElse(0));
        int avgMatch = recentMatches.isEmpty() ? 0 :
                (int) Math.round(recentMatches.stream().mapToInt(JobMatch::getJobMatchScore).average().orElse(0));

        List<ScorePoint> atsHistory = reversed(recentAnalyses).stream()
                .map(a -> new ScorePoint(a.getCreatedAt(), a.getAtsScore(), a.getResume().getOriginalFileName()))
                .toList();

        List<ScorePoint> matchHistory = reversed(recentMatches).stream()
                .map(m -> new ScorePoint(m.getCreatedAt(), m.getJobMatchScore(), m.getJobTitle()))
                .toList();

        var recentResumes = resumeRepository.findTop5ByUserOrderByCreatedAtDesc(user).stream()
                .map(resumeService::toResponse)
                .toList();

        return new DashboardResponse(
                new Totals(totalResumes, totalAnalyses, totalJobMatches),
                new Averages(avgAts, avgMatch),
                new Trends(atsHistory, matchHistory),
                recentResumes
        );
    }

    private <T> List<T> reversed(List<T> list) {
        List<T> copy = new java.util.ArrayList<>(list);
        Collections.reverse(copy);
        return copy;
    }
}
