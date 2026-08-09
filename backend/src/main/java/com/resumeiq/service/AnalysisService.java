package com.resumeiq.service;

import com.resumeiq.dto.AnalysisDtos.AnalysisAiResult;
import com.resumeiq.dto.AnalysisDtos.AnalysisResponse;
import com.resumeiq.dto.AnalysisDtos.AnalysisSummaryResponse;
import com.resumeiq.exception.ApiException;
import com.resumeiq.model.Analysis;
import com.resumeiq.model.Resume;
import com.resumeiq.model.User;
import com.resumeiq.repository.AnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AnalysisRepository analysisRepository;
    private final ResumeService resumeService;
    private final GroqService groqService;

    private static final String SYSTEM_PROMPT = """
        You are an expert ATS (Applicant Tracking System) analyst and professional resume \
        reviewer with 10+ years of experience in technical recruiting. You always respond with \
        raw JSON only - no markdown, no code fences, no commentary outside the JSON object.
        """;

    @Transactional
    public AnalysisResponse analyze(User user, UUID resumeId) {
        Resume resume = resumeService.getOwned(user, resumeId);

        String userPrompt = buildPrompt(resume.getExtractedText());
        AnalysisAiResult result = groqService.generateStructured(SYSTEM_PROMPT, userPrompt, AnalysisAiResult.class);
        validate(result);

        Analysis analysis = new Analysis();
        analysis.setUser(user);
        analysis.setResume(resume);
        analysis.setAtsScore(clamp(result.atsScore()));
        analysis.setGrammarScore(clamp(result.grammarScore()));
        analysis.setFormattingScore(clamp(result.formattingScore()));
        analysis.setResumeQualityScore(clamp(result.resumeQualityScore()));
        analysis.setSummary(result.summary());
        analysis.setStrengths(result.strengths());
        analysis.setWeaknesses(result.weaknesses());
        analysis.setMissingSkills(result.missingSkills());
        analysis.setMissingKeywords(result.missingKeywords());
        analysis.setImprovementSuggestions(result.improvementSuggestions());
        analysis.setCareerRecommendations(result.careerRecommendations());
        analysis.setTechnicalInterviewQuestions(result.technicalInterviewQuestions());
        analysis.setHrInterviewQuestions(result.hrInterviewQuestions());

        analysis = analysisRepository.save(analysis);
        return toResponse(analysis);
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getOwned(User user, UUID id) {
        Analysis analysis = analysisRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ApiException.notFound("Analysis not found"));
        return toResponse(analysis);
    }

    @Transactional(readOnly = true)
    public List<AnalysisSummaryResponse> history(User user) {
        return analysisRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(a -> new AnalysisSummaryResponse(a.getId(), a.getResume().getOriginalFileName(), a.getAtsScore(), a.getCreatedAt()))
                .toList();
    }

    /** Loads the Analysis entity (not DTO) with ownership check - used by other services needing raw text context. */
    @Transactional(readOnly = true)
    public Analysis getEntityOwned(User user, UUID id) {
        return analysisRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ApiException.notFound("Analysis not found"));
    }

    @Transactional(readOnly = true)
    List<Analysis> recentForUser(User user, int limit) {
        List<Analysis> all = analysisRepository.findTop10ByUserOrderByCreatedAtDesc(user);
        // Touch the lazy resume association for each while the session is still open,
        // so callers (e.g. DashboardService) can safely read it after this returns.
        all.forEach(a -> a.getResume().getOriginalFileName());
        return all.size() > limit ? all.subList(0, limit) : all;
    }

    private void validate(AnalysisAiResult r) {
        if (r == null || r.atsScore() == null || r.strengths() == null || r.weaknesses() == null) {
            throw ApiException.badGateway("AI response for resume analysis was incomplete. Please try again.");
        }
    }

    private Integer clamp(Integer v) {
        if (v == null) return 0;
        return Math.max(0, Math.min(100, v));
    }

    private String buildPrompt(String resumeText) {
        String truncated = resumeText.length() > 15000 ? resumeText.substring(0, 15000) : resumeText;
        return """
            Analyze the following resume text and return ONLY a JSON object with EXACTLY this structure:

            {
              "atsScore": <integer 0-100, how well this resume would pass an ATS parser>,
              "grammarScore": <integer 0-100>,
              "formattingScore": <integer 0-100>,
              "resumeQualityScore": <integer 0-100>,
              "summary": "<2-3 sentence neutral summary of the candidate's background>",
              "strengths": ["<specific strength>"],
              "weaknesses": ["<specific weakness>"],
              "missingSkills": ["<skill commonly expected for this field but absent>"],
              "missingKeywords": ["<ATS keyword that could strengthen this resume>"],
              "improvementSuggestions": ["<specific, actionable suggestion>"],
              "careerRecommendations": ["<realistic next-step role based on ACTUAL experience>"],
              "technicalInterviewQuestions": ["<question tailored to the candidate's actual skills>"],
              "hrInterviewQuestions": ["<behavioral question relevant to this candidate>"]
            }

            Rules:
            - Base every observation strictly on the resume text provided. Do not invent experience.
            - Never suggest the candidate claim skills or experience they do not have; only suggest \
            they LEARN missing skills or better ARTICULATE existing experience.
            - Provide 3-6 items for each array field. Scores must be integers 0-100. Return raw JSON only.

            RESUME TEXT:
            \"\"\"
            %s
            \"\"\"
            """.formatted(truncated);
    }

    private AnalysisResponse toResponse(Analysis a) {
        return new AnalysisResponse(
                a.getId(), a.getResume().getId(), a.getResume().getOriginalFileName(),
                a.getAtsScore(), a.getGrammarScore(), a.getFormattingScore(), a.getResumeQualityScore(),
                a.getSummary(), a.getStrengths(), a.getWeaknesses(), a.getMissingSkills(), a.getMissingKeywords(),
                a.getImprovementSuggestions(), a.getCareerRecommendations(),
                a.getTechnicalInterviewQuestions(), a.getHrInterviewQuestions(), a.getCreatedAt()
        );
    }
}
