package com.resumeiq.controller;

import com.resumeiq.dto.AnalysisDtos.AnalysisResponse;
import com.resumeiq.security.UserPrincipal;
import com.resumeiq.service.AnalysisService;
import com.resumeiq.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AnalysisService analysisService;

    @PostMapping("/analyze/{resumeId}")
    public ApiResponse<AnalysisResponse> analyze(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID resumeId
    ) {
        return ApiResponse.ok(analysisService.analyze(principal.getUser(), resumeId), "Resume analysis complete");
    }

    @GetMapping("/analysis/{id}")
    public ApiResponse<AnalysisResponse> getAnalysis(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id
    ) {
        return ApiResponse.ok(analysisService.getOwned(principal.getUser(), id));
    }
}
