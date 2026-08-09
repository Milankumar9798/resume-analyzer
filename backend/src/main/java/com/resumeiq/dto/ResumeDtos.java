package com.resumeiq.dto;

import java.time.Instant;
import java.util.UUID;

public class ResumeDtos {

    public record ResumeResponse(
            UUID id,
            String originalFileName,
            String fileType,
            Long fileSize,
            Instant createdAt
    ) {}
}
