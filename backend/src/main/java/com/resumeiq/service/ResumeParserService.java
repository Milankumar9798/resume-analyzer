package com.resumeiq.service;

import com.resumeiq.exception.ApiException;
import com.resumeiq.model.Resume;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
public class ResumeParserService {

    private static final long MAX_SIZE = 5L * 1024 * 1024;

    public Resume.FileType resolveFileType(MultipartFile file) {
        String contentType = file.getContentType();
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";

        boolean isPdf = "application/pdf".equals(contentType) || name.endsWith(".pdf");
        boolean isDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(contentType)
                || name.endsWith(".docx");

        if (isPdf) return Resume.FileType.PDF;
        if (isDocx) return Resume.FileType.DOCX;
        throw ApiException.badRequest("Only PDF and DOCX files are allowed");
    }

    public void validateSize(MultipartFile file) {
        if (file.getSize() > MAX_SIZE) {
            throw ApiException.badRequest("File too large. Maximum size is 5MB.");
        }
        if (file.isEmpty()) {
            throw ApiException.badRequest("Uploaded file is empty");
        }
    }

    public String extractText(MultipartFile file, Resume.FileType fileType) {
        String text;
        try (InputStream is = file.getInputStream()) {
            text = switch (fileType) {
                case PDF -> extractPdf(is);
                case DOCX -> extractDocx(is);
            };
        } catch (IOException e) {
            throw ApiException.badRequest("Could not read the uploaded file");
        }

        String cleaned = text.replaceAll("\\s+", " ").trim();

        if (cleaned.length() < 50) {
            throw new ApiException(
                    org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY,
                    "Could not extract readable text from this file. It may be scanned/image-based or corrupted."
            );
        }

        return cleaned;
    }

    private String extractPdf(InputStream is) {
        try (PDDocument document = PDDocument.load(is)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException e) {
            throw ApiException.badRequest("Failed to parse PDF file");
        }
    }

    private String extractDocx(InputStream is) {
        try (XWPFDocument document = new XWPFDocument(is);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        } catch (IOException e) {
            throw ApiException.badRequest("Failed to parse DOCX file");
        }
    }
}
