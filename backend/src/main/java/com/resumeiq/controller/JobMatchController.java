package com.resumeiq.controller;

import com.resumeiq.dto.JobMatchDtos.*;
import com.resumeiq.security.UserPrincipal;
import com.resumeiq.service.JobMatchService;
import com.resumeiq.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/job-match")
@RequiredArgsConstructor
public class JobMatchController {

    private final JobMatchService jobMatchService;

    @PostMapping
    public ApiResponse<JobMatchResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JobMatchRequest req
    ) {
        return ApiResponse.ok(jobMatchService.createMatch(principal.getUser(), req), "Job match analysis complete");
    }

    @GetMapping("/{id}")
    public ApiResponse<JobMatchResponse> getOne(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return ApiResponse.ok(jobMatchService.getOwned(principal.getUser(), id));
    }

    @GetMapping
    public ApiResponse<List<JobMatchSummaryResponse>> history(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(jobMatchService.history(principal.getUser()));
    }
}
