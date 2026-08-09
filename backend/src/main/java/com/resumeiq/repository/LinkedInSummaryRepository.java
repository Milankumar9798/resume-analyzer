package com.resumeiq.repository;

import com.resumeiq.model.LinkedInSummary;
import com.resumeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LinkedInSummaryRepository extends JpaRepository<LinkedInSummary, UUID> {
    List<LinkedInSummary> findByUserOrderByCreatedAtDesc(User user);
    Optional<LinkedInSummary> findByIdAndUser(UUID id, User user);
}
