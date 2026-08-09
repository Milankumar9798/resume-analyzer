package com.resumeiq.service;

import com.resumeiq.dto.JobMatchDtos.*;
import com.resumeiq.exception.ApiException;
import com.resumeiq.model.JobMatch;
import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import com.resumeiq.repository.JobMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobMatchService {

    private final JobMatchRepository jobMatchRepository;
    private final ResumeService resumeService;
    private final GroqService groqService;

    private static final String SYSTEM_PROMPT = """
        You are an expert technical recruiter and career coach with 10+ years of experience \
        matching candidates to job descriptions. You always respond with raw JSON only - no \
        markdown, no code fences, no commentary outside the JSON object.
        """;

    @Transactional
    public JobMatchResponse createMatch(User user, JobMatchRequest req) {
        Resume resume = resumeService.getOwned(user, req.resumeId());

        String userPrompt = buildPrompt(resume.getExtractedText(), req.jobDescription());
        JobMatchAiResult result = groqService.generateStructured(SYSTEM_PROMPT, userPrompt, JobMatchAiResult.class);
        validate(result);

        JobMatch match = new JobMatch();
        match.setUser(user);
        match.setResume(resume);
        match.setJobTitle(req.jobTitle() != null ? req.jobTitle() : "");
        match.setCompanyName(req.companyName() != null ? req.companyName() : "");
        match.setJobDescription(req.jobDescription());
        match.setJobMatchScore(clamp(result.jobMatchScore()));
        match.setSkillsMatchScore(clamp(result.skillsMatchScore()));
        match.setKeywordMatchScore(clamp(result.keywordMatchScore()));
        match.setExperienceMatchScore(clamp(result.experienceMatchScore()));
        match.setEducationMatchScore(clamp(result.educationMatchScore()));
        match.setProjectMatchScore(clamp(result.projectMatchScore()));
        match.setMatchedSkills(result.matchedSkills());
        match.setMissingSkills(result.missingSkills());
        match.setMatchedKeywords(result.matchedKeywords());
        match.setMissingKeywords(result.missingKeywords());
        match.setStrengths(result.strengths());
        match.setWeaknesses(result.weaknesses());
        match.setOptimizationSuggestions(result.optimizationSuggestions());
        match.setLearningRoadmap(result.learningRoadmap());
        match.setJobSpecificInterviewQuestions(result.jobSpecificInterviewQuestions());

        match = jobMatchRepository.save(match);
        return toResponse(match);
    }

    @Transactional(readOnly = true)
    public JobMatchResponse getOwned(User user, UUID id) {
        return toResponse(getEntityOwnedInternal(user, id));
    }

    @Transactional(readOnly = true)
    public JobMatch getEntityOwned(User user, UUID id) {
        return getEntityOwnedInternal(user, id);
    }

    private JobMatch getEntityOwnedInternal(User user, UUID id) {
        return jobMatchRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ApiException.notFound("Job match not found"));
    }

    @Transactional(readOnly = true)
    public List<JobMatchSummaryResponse> history(User user) {
        return jobMatchRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(m -> new JobMatchSummaryResponse(m.getId(), m.getJobTitle(), m.getCompanyName(), m.getJobMatchScore(), m.getCreatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    List<JobMatch> recentForUser(User user, int limit) {
        List<JobMatch> all = jobMatchRepository.findTop10ByUserOrderByCreatedAtDesc(user);
        all.forEach(m -> m.getResume().getOriginalFileName());
        return all.size() > limit ? all.subList(0, limit) : all;
    }

    private void validate(JobMatchAiResult r) {
        if (r == null || r.jobMatchScore() == null || r.matchedSkills() == null || r.missingSkills() == null) {
            throw ApiException.badGateway("AI response for job match was incomplete. Please try again.");
        }
    }

    private Integer clamp(Integer v) {
        if (v == null) return 0;
        return Math.max(0, Math.min(100, v));
    }

    private String buildPrompt(String resumeText, String jobDescription) {
        String truncatedResume = resumeText.length() > 15000 ? resumeText.substring(0, 15000) : resumeText;
        String truncatedJd = jobDescription.length() > 8000 ? jobDescription.substring(0, 8000) : jobDescription;

        return """
            Compare the RESUME against the JOB DESCRIPTION below and return ONLY a JSON object \
            with EXACTLY this structure:

            {
              "jobMatchScore": <integer 0-100, overall fit>,
              "skillsMatchScore": <integer 0-100>,
              "keywordMatchScore": <integer 0-100>,
              "experienceMatchScore": <integer 0-100>,
              "educationMatchScore": <integer 0-100>,
              "projectMatchScore": <integer 0-100>,
              "matchedSkills": ["<skill present in both>"],
              "missingSkills": ["<skill required by JD but absent from resume>"],
              "matchedKeywords": ["<keyword present in both>"],
              "missingKeywords": ["<important JD keyword absent from resume>"],
              "strengths": ["<specific reason this candidate fits well>"],
              "weaknesses": ["<specific gap versus this JD>"],
              "optimizationSuggestions": ["<specific edit using only the candidate's REAL experience>"],
              "learningRoadmap": ["<ordered, specific learning step to close a real gap>"],
              "jobSpecificInterviewQuestions": ["<question likely asked for THIS role>"]
            }

            Rules:
            - Base every score and observation on literal comparison between the two texts.
            - NEVER suggest the candidate claim skills or experience they do not actually have.
            - Provide 3-6 items for each array field. Scores must be integers 0-100. Return raw JSON only.

            RESUME:
            \"\"\"
            %s
            \"\"\"

            JOB DESCRIPTION:
            \"\"\"
            %s
            \"\"\"
            """.formatted(truncatedResume, truncatedJd);
    }

    private JobMatchResponse toResponse(JobMatch m) {
        return new JobMatchResponse(
                m.getId(), m.getResume().getId(), m.getResume().getOriginalFileName(),
                m.getJobTitle(), m.getCompanyName(),
                m.getJobMatchScore(), m.getSkillsMatchScore(), m.getKeywordMatchScore(),
                m.getExperienceMatchScore(), m.getEducationMatchScore(), m.getProjectMatchScore(),
                m.getMatchedSkills(), m.getMissingSkills(), m.getMatchedKeywords(), m.getMissingKeywords(),
                m.getStrengths(), m.getWeaknesses(), m.getOptimizationSuggestions(),
                m.getLearningRoadmap(), m.getJobSpecificInterviewQuestions(), m.getCreatedAt()
        );
    }
}
