package com.resumeiq.controller;

import com.resumeiq.dto.ChatDtos.*;
import com.resumeiq.model.ChatMessage;
import com.resumeiq.security.UserPrincipal;
import com.resumeiq.service.ChatService;
import com.resumeiq.util.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/resume/{resumeId}")
    public ApiResponse<List<ChatMessageResponse>> resumeHistory(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID resumeId
    ) {
        return ApiResponse.ok(chatService.getHistory(principal.getUser(), ChatMessage.ContextType.RESUME, resumeId));
    }

    @PostMapping("/resume/{resumeId}")
    public ApiResponse<ChatMessageResponse> resumeSend(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID resumeId,
            @Valid @RequestBody ChatRequest req
    ) {
        return ApiResponse.ok(chatService.sendMessage(principal.getUser(), ChatMessage.ContextType.RESUME, resumeId, req.message()));
    }

    @GetMapping("/job-match/{jobMatchId}")
    public ApiResponse<List<ChatMessageResponse>> jobMatchHistory(
            @AuthenticationPrincipal UserPrincipal principal, @PathVariable UUID jobMatchId
    ) {
        return ApiResponse.ok(chatService.getHistory(principal.getUser(), ChatMessage.ContextType.JOB_MATCH, jobMatchId));
    }

    @PostMapping("/job-match/{jobMatchId}")
    public ApiResponse<ChatMessageResponse> jobMatchSend(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID jobMatchId,
            @Valid @RequestBody ChatRequest req
    ) {
        return ApiResponse.ok(chatService.sendMessage(principal.getUser(), ChatMessage.ContextType.JOB_MATCH, jobMatchId, req.message()));
    }
}
