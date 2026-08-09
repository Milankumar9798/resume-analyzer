package com.resumeiq.repository;

import com.resumeiq.model.CoverLetter;
import com.resumeiq.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CoverLetterRepository extends JpaRepository<CoverLetter, UUID> {
    List<CoverLetter> findByUserOrderByCreatedAtDesc(User user);
    Optional<CoverLetter> findByIdAndUser(UUID id, User user);
}
