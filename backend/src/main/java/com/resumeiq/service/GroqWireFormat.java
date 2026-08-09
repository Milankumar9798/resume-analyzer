package com.resumeiq.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GroqWireFormat {

    public record ChatMessage(String role, String content) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ChatCompletionRequest(
            String model,
            List<ChatMessage> messages,
            Double temperature,
            @com.fasterxml.jackson.annotation.JsonProperty("response_format") Map<String, String> responseFormat,
            @com.fasterxml.jackson.annotation.JsonProperty("max_tokens") Integer maxTokens
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(ChatMessage message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ChatCompletionResponse(List<Choice> choices) {}
}
