package com.resumeiq.controller;

import com.resumeiq.dto.ResumeDtos.ResumeResponse;
import com.resumeiq.security.UserPrincipal;
import com.resumeiq.service.ResumeService;
import com.resumeiq.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ApiResponse<ResumeResponse> upload(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("resume") MultipartFile file
    ) {
        return ApiResponse.ok(resumeService.upload(principal.getUser(), file), "Resume uploaded and parsed successfully");
    }

    @GetMapping
    public ApiResponse<List<ResumeResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(resumeService.list(principal.getUser()));
    }

    @GetMapping("/{id}")
    public ApiResponse<ResumeResponse> getOne(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        return ApiResponse.ok(resumeService.toResponse(resumeService.getOwned(principal.getUser(), id)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID id) {
        resumeService.delete(principal.getUser(), id);
        return ApiResponse.ok(null, "Resume deleted");
    }
}
