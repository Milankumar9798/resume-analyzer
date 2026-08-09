package com.resumeiq.service;

import com.resumeiq.dto.GeneratorDtos.*;
import com.resumeiq.model.CoverLetter;
import com.resumeiq.model.LinkedInSummary;
import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import com.resumeiq.repository.CoverLetterRepository;
import com.resumeiq.repository.LinkedInSummaryRepository;
import com.resumeiq.service.GroqWireFormat.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GeneratorService {

    private static final Set<String> VALID_TONES = Set.of("professional", "conversational", "confident");

    private final ResumeService resumeService;
    private final GroqService groqService;
    private final CoverLetterRepository coverLetterRepository;
    private final LinkedInSummaryRepository linkedInSummaryRepository;

    @Transactional
    public CoverLetterResponse generateCoverLetter(User user, CoverLetterRequest req) {
        Resume resume = resumeService.getOwned(user, req.resumeId());

        String systemPrompt = """
            You are an expert career writer. Write a compelling, honest cover letter using ONLY the \
            candidate's real experience from the resume provided - never invent skills, employers, \
            titles, or accomplishments. Return plain text only: no markdown headers, no code fences, \
            no commentary before or after the letter itself. Keep it to 3-4 short paragraphs, \
            professional but not generic, and specific to the job description and company given.
            """;

        String userPrompt = """
            Resume:
            \"\"\"
            %s
            \"\"\"

            Job title: %s
            Company: %s
            Job description:
            \"\"\"
            %s
            \"\"\"

            Write the cover letter now.
            """.formatted(
                truncate(resume.getExtractedText(), 12000),
                req.jobTitle(),
                req.companyName(),
                truncate(req.jobDescription(), 6000)
        );

        String content = groqService.generateText(systemPrompt, List.of(new ChatMessage("user", userPrompt)));

        CoverLetter letter = new CoverLetter();
        letter.setUser(user);
        letter.setResume(resume);
        letter.setCompanyName(req.companyName());
        letter.setJobTitle(req.jobTitle());
        letter.setJobDescription(req.jobDescription());
        letter.setContent(content.trim());
        letter = coverLetterRepository.save(letter);

        return new CoverLetterResponse(letter.getId(), letter.getCompanyName(), letter.getJobTitle(), letter.getContent(), letter.getCreatedAt());
    }

    @Transactional
    public LinkedInSummaryResponse generateLinkedInSummary(User user, LinkedInSummaryRequest req) {
        Resume resume = resumeService.getOwned(user, req.resumeId());
        String tone = (req.tone() != null && VALID_TONES.contains(req.tone().toLowerCase())) ? req.tone().toLowerCase() : "professional";

        String systemPrompt = """
            You are an expert LinkedIn profile writer. Write a compelling "About" section using ONLY \
            the candidate's real experience from the resume provided - never invent skills, employers, \
            or accomplishments. Return plain text only: no markdown, no headers, no commentary. \
            Write in first person, 3-5 short paragraphs, optimized for LinkedIn search/keywords \
            relevant to the candidate's real background. Tone: %s.
            """.formatted(tone);

        String userPrompt = """
            Resume:
            \"\"\"
            %s
            \"\"\"

            Write the LinkedIn About section now.
            """.formatted(truncate(resume.getExtractedText(), 12000));

        String content = groqService.generateText(systemPrompt, List.of(new ChatMessage("user", userPrompt)));

        LinkedInSummary summary = new LinkedInSummary();
        summary.setUser(user);
        summary.setResume(resume);
        summary.setTone(tone);
        summary.setContent(content.trim());
        summary = linkedInSummaryRepository.save(summary);

        return new LinkedInSummaryResponse(summary.getId(), summary.getTone(), summary.getContent(), summary.getCreatedAt());
    }

    private String truncate(String text, int max) {
        return text.length() > max ? text.substring(0, max) : text;
    }
}
