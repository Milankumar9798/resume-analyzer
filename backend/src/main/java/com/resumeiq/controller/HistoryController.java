package com.resumeiq.controller;

import com.resumeiq.dto.AnalysisDtos.AnalysisSummaryResponse;
import com.resumeiq.dto.DashboardDtos.DashboardResponse;
import com.resumeiq.dto.JobMatchDtos.JobMatchSummaryResponse;
import com.resumeiq.security.UserPrincipal;
import com.resumeiq.service.AnalysisService;
import com.resumeiq.service.DashboardService;
import com.resumeiq.service.JobMatchService;
import com.resumeiq.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class HistoryController {

    private final DashboardService dashboardService;
    private final AnalysisService analysisService;
    private final JobMatchService jobMatchService;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardResponse> dashboard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(dashboardService.getStats(principal.getUser()));
    }

    @GetMapping("/analyses")
    public ApiResponse<List<AnalysisSummaryResponse>> analyses(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(analysisService.history(principal.getUser()));
    }

    @GetMapping("/job-matches")
    public ApiResponse<List<JobMatchSummaryResponse>> jobMatches(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(jobMatchService.history(principal.getUser()));
    }
}
