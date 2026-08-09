package com.resumeiq.repository;

import com.resumeiq.model.JobMatch;
import com.resumeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JobMatchRepository extends JpaRepository<JobMatch, UUID> {
    List<JobMatch> findByUserOrderByCreatedAtDesc(User user);
    Optional<JobMatch> findByIdAndUser(UUID id, User user);
    long countByUser(User user);
    List<JobMatch> findTop10ByUserOrderByCreatedAtDesc(User user);
}
