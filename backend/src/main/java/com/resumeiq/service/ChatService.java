package com.resumeiq.service;

import com.resumeiq.dto.ChatDtos.ChatMessageResponse;
import com.resumeiq.model.ChatMessage;
import com.resumeiq.model.JobMatch;
import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import com.resumeiq.repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private static final int MAX_HISTORY_TURNS = 12;

    private final ChatMessageRepository chatMessageRepository;
    private final ResumeService resumeService;
    private final JobMatchService jobMatchService;
    private final GroqService groqService;

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getHistory(User user, ChatMessage.ContextType type, UUID contextId) {
        // Ownership check: this throws 404 if the underlying resume/job match isn't the user's.
        assertOwnership(user, type, contextId);

        return chatMessageRepository
                .findByUserAndContextTypeAndContextIdOrderByCreatedAtAsc(user, type, contextId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ChatMessageResponse sendMessage(User user, ChatMessage.ContextType type, UUID contextId, String userMessage) {
        String groundingText = assertOwnership(user, type, contextId);

        // Persist the user's turn first.
        ChatMessage userTurn = new ChatMessage();
        userTurn.setUser(user);
        userTurn.setContextType(type);
        userTurn.setContextId(contextId);
        userTurn.setRole(ChatMessage.SenderRole.USER);
        userTurn.setContent(userMessage);
        chatMessageRepository.save(userTurn);

        List<ChatMessage> history = chatMessageRepository
                .findByUserAndContextTypeAndContextIdOrderByCreatedAtAsc(user, type, contextId);

        List<com.resumeiq.service.GroqWireFormat.ChatMessage> conversation = history.stream()
                .skip(Math.max(0, history.size() - MAX_HISTORY_TURNS))
                .map(m -> new com.resumeiq.service.GroqWireFormat.ChatMessage(
                        m.getRole() == ChatMessage.SenderRole.USER ? "user" : "assistant",
                        m.getContent()
                ))
                .toList();

        String systemPrompt = buildSystemPrompt(type, groundingText);
        String replyText = groqService.generateText(systemPrompt, conversation);

        ChatMessage assistantTurn = new ChatMessage();
        assistantTurn.setUser(user);
        assistantTurn.setContextType(type);
        assistantTurn.setContextId(contextId);
        assistantTurn.setRole(ChatMessage.SenderRole.ASSISTANT);
        assistantTurn.setContent(replyText);
        chatMessageRepository.save(assistantTurn);

        return toResponse(assistantTurn);
    }

    /** Verifies the context belongs to this user and returns the grounding text to feed the model. */
    private String assertOwnership(User user, ChatMessage.ContextType type, UUID contextId) {
        if (type == ChatMessage.ContextType.RESUME) {
            Resume resume = resumeService.getOwned(user, contextId);
            return resume.getExtractedText();
        } else {
            JobMatch match = jobMatchService.getEntityOwned(user, contextId);
            return "RESUME:\n" + match.getResume().getExtractedText()
                    + "\n\nJOB DESCRIPTION:\n" + match.getJobDescription();
        }
    }

    private String buildSystemPrompt(ChatMessage.ContextType type, String groundingText) {
        String truncated = groundingText.length() > 12000 ? groundingText.substring(0, 12000) : groundingText;

        String roleSpecific = type == ChatMessage.ContextType.RESUME
                ? "You are a friendly, expert resume and career coach helping a candidate improve their " +
                  "resume, choose skills to learn, and identify roles that fit their real background."
                : "You are a friendly, expert career coach helping a candidate understand how well they " +
                  "match a specific job posting, why their match score is what it is, and what to do next.";

        return """
            %s

            Ground every answer strictly in the context below - never invent skills, experience, or \
            qualifications the candidate doesn't actually have. If asked to help embellish or fabricate \
            experience, politely decline and redirect toward honestly framing real experience or learning \
            the missing skill instead. Keep replies conversational, concise, and actionable (a few short \
            paragraphs or a short list, not an essay).

            CONTEXT:
            \"\"\"
            %s
            \"\"\"
            """.formatted(roleSpecific, truncated);
    }

    private ChatMessageResponse toResponse(ChatMessage m) {
        return new ChatMessageResponse(m.getId(), m.getRole().name(), m.getContent(), m.getCreatedAt());
    }
}
