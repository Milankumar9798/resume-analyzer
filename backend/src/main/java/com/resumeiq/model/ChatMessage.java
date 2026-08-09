package com.resumeiq.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** RESUME or JOB_MATCH - which kind of conversation this belongs to. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContextType contextType;

    /** The Resume id or JobMatch id this conversation is grounded in. */
    @Column(nullable = false)
    private UUID contextId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SenderRole role;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum ContextType {
        RESUME, JOB_MATCH
    }

    public enum SenderRole {
        USER, ASSISTANT
    }
}
