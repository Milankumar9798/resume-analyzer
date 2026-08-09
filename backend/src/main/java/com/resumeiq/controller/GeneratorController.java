package com.resumeiq.controller;

import com.resumeiq.dto.GeneratorDtos.*;
import com.resumeiq.security.UserPrincipal;
import com.resumeiq.service.GeneratorService;
import com.resumeiq.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/generate")
@RequiredArgsConstructor
public class GeneratorController {

    private final GeneratorService generatorService;

    @PostMapping("/cover-letter")
    public ApiResponse<CoverLetterResponse> coverLetter(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CoverLetterRequest req
    ) {
        return ApiResponse.ok(generatorService.generateCoverLetter(principal.getUser(), req), "Cover letter generated");
    }

    @PostMapping("/linkedin-summary")
    public ApiResponse<LinkedInSummaryResponse> linkedInSummary(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody LinkedInSummaryRequest req
    ) {
        return ApiResponse.ok(generatorService.generateLinkedInSummary(principal.getUser(), req), "LinkedIn summary generated");
    }
}
