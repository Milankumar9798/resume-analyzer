package com.resumeiq.repository;

import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByUserOrderByCreatedAtDesc(User user);
    Optional<Resume> findByIdAndUser(UUID id, User user);
    long countByUser(User user);
    List<Resume> findTop5ByUserOrderByCreatedAtDesc(User user);
}
