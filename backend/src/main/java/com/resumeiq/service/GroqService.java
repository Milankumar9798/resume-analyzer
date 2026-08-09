package com.resumeiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.exception.ApiException;
import com.resumeiq.service.GroqWireFormat.ChatCompletionRequest;
import com.resumeiq.service.GroqWireFormat.ChatCompletionResponse;
import com.resumeiq.service.GroqWireFormat.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Wraps the Groq (OpenAI-compatible) chat completions API. Used both for
 * strict structured-JSON generation (ATS analysis, job match, etc.) and
 * free-text generation (chat replies, cover letters, LinkedIn summaries).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GroqService {

    private static final int MAX_RETRIES = 1;

    private final RestClient groqRestClient;
    private final ObjectMapper objectMapper;

    @Value("${app.groq.model}")
    private String model;

    @Value("${app.groq.api-key}")
    private String apiKey;

    /**
     * Sends a system + user prompt and parses the reply as JSON into the given type.
     * Retries once on transient failure or malformed JSON before giving up with a 502.
     */
    public <T> T generateStructured(String systemPrompt, String userPrompt, Class<T> type) {
        List<ChatMessage> conversation = List.of(new ChatMessage("user", userPrompt));
        String raw = execute(systemPrompt, conversation, true);
        try {
            return objectMapper.readValue(raw, type);
        } catch (Exception e) {
            log.error("Failed to parse Groq structured response: {}", e.getMessage());
            throw ApiException.badGateway("AI service returned an unexpected format. Please try again.");
        }
    }

    /**
     * Sends a system prompt plus a running conversation (history + latest user turn)
     * and returns the plain-text reply. Used for chat and free-form generation.
     */
    public String generateText(String systemPrompt, List<ChatMessage> conversation) {
        return execute(systemPrompt, conversation, false);
    }

    // -------------------------------------------------------------------------

    private String execute(String systemPrompt, List<ChatMessage> conversationWithoutSystem, boolean jsonMode) {
        if (apiKey == null || apiKey.isBlank()) {
            throw ApiException.badGateway("Groq API key is not configured on the server.");
        }

        List<ChatMessage> fullConversation = new ArrayList<>();
        fullConversation.add(new ChatMessage("system", systemPrompt));
        fullConversation.addAll(conversationWithoutSystem);

        ChatCompletionRequest request = new ChatCompletionRequest(
                model,
                fullConversation,
                0.4,
                jsonMode ? Map.of("type", "json_object") : null,
                2048
        );

        Exception lastError = null;
        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                ChatCompletionResponse response = groqRestClient.post()
                        .uri("/chat/completions")
                        .body(request)
                        .retrieve()
                        .body(ChatCompletionResponse.class);

                if (response == null || response.choices() == null || response.choices().isEmpty()) {
                    throw new IllegalStateException("Empty response from Groq");
                }
                return response.choices().get(0).message().content();
            } catch (Exception e) {
                lastError = e;
                log.warn("Groq call failed (attempt {}): {}", attempt + 1, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try { Thread.sleep(800); } catch (InterruptedException ignored) {}
                }
            }
        }

        log.error("Groq API failure after retries: {}", lastError != null ? lastError.getMessage() : "unknown");
        throw ApiException.badGateway("AI service failed to generate a response. Please try again.");
    }
}
