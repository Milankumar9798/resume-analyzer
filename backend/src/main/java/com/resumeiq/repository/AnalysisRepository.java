package com.resumeiq.repository;

import com.resumeiq.model.Analysis;
import com.resumeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {
    List<Analysis> findByUserOrderByCreatedAtDesc(User user);
    Optional<Analysis> findByIdAndUser(UUID id, User user);
    long countByUser(User user);
    List<Analysis> findTop10ByUserOrderByCreatedAtDesc(User user);
}
