package com.resumeiq.repository;

import com.resumeiq.model.ChatMessage;
import com.resumeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByUserAndContextTypeAndContextIdOrderByCreatedAtAsc(
            User user, ChatMessage.ContextType contextType, UUID contextId
    );
}
