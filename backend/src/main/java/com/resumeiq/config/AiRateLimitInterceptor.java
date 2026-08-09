package com.resumeiq.config;

import com.resumeiq.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window (1 hour) per-user rate limiter for the AI-backed endpoints
 * (analysis, job match, chat, generators) so a single account can't burn
 * through the Groq quota. Simple in-memory counter - fine for a single
 * instance deployment; swap for Redis if scaling horizontally.
 */
@Component
public class AiRateLimitInterceptor implements HandlerInterceptor {

    private record Window(int count, Instant resetAt) {}

    private final ConcurrentHashMap<UUID, Window> windows = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.ai-requests-per-hour}")
    private int limit;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal principal)) {
            return true; // let normal auth handling reject unauthenticated requests
        }

        UUID userId = principal.getUser().getId();
        Instant now = Instant.now();

        Window updated = windows.compute(userId, (id, existing) -> {
            if (existing == null || now.isAfter(existing.resetAt())) {
                return new Window(1, now.plusSeconds(3600));
            }
            return new Window(existing.count() + 1, existing.resetAt());
        });

        if (updated.count() > limit) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                    "{\"success\":false,\"message\":\"AI request limit reached, please try again later.\"}"
            );
            return false;
        }

        return true;
    }
}
