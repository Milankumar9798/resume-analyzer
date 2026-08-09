package com.resumeiq.service;

import com.resumeiq.dto.ResumeDtos.ResumeResponse;
import com.resumeiq.exception.ApiException;
import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import com.resumeiq.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final ResumeParserService parserService;

    @Transactional
    public ResumeResponse upload(User user, MultipartFile file) {
        parserService.validateSize(file);
        Resume.FileType fileType = parserService.resolveFileType(file);
        String text = parserService.extractText(file, fileType);

        Resume resume = new Resume();
        resume.setUser(user);
        resume.setOriginalFileName(file.getOriginalFilename());
        resume.setFileType(fileType);
        resume.setFileSize(file.getSize());
        resume.setExtractedText(text);

        resume = resumeRepository.save(resume);
        return toResponse(resume);
    }

    @Transactional(readOnly = true)
    public List<ResumeResponse> list(User user) {
        return resumeRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Resume getOwned(User user, UUID id) {
        return resumeRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ApiException.notFound("Resume not found"));
    }

    @Transactional
    public void delete(User user, UUID id) {
        Resume resume = getOwned(user, id);
        resumeRepository.delete(resume);
    }

    public ResumeResponse toResponse(Resume r) {
        return new ResumeResponse(
                r.getId(), r.getOriginalFileName(), r.getFileType().name(), r.getFileSize(), r.getCreatedAt()
        );
    }
}
