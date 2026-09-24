package com.andara.erp.dto.numbering;

import com.andara.erp.entity.DocumentType;
import com.andara.erp.entity.NumberingConfiguration;
import com.andara.erp.entity.ResetPeriod;

import java.time.OffsetDateTime;

public class NumberingConfigurationDTO {

    private Long id;
    private DocumentType documentType;
    private String prefix;
    private String suffix;
    private Integer counterDigits;
    private ResetPeriod resetPeriod;
    private Integer currentCounter;
    private String currentPeriod;
    private String formatPattern;
    private String previewNumber;
    private OffsetDateTime updatedAt;

    public NumberingConfigurationDTO() {
    }

    public static NumberingConfigurationDTO fromEntity(NumberingConfiguration entity, String previewNumber) {
        NumberingConfigurationDTO dto = new NumberingConfigurationDTO();
        dto.setId(entity.getId());
        dto.setDocumentType(entity.getDocumentType());
        dto.setPrefix(entity.getPrefix());
        dto.setSuffix(entity.getSuffix());
        dto.setCounterDigits(entity.getCounterDigits());
        dto.setResetPeriod(entity.getResetPeriod());
        dto.setCurrentCounter(entity.getCurrentCounter());
        dto.setCurrentPeriod(entity.getCurrentPeriod());
        dto.setFormatPattern(entity.getFormatPattern());
        dto.setPreviewNumber(previewNumber);
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public String getSuffix() {
        return suffix;
    }

    public void setSuffix(String suffix) {
        this.suffix = suffix;
    }

    public Integer getCounterDigits() {
        return counterDigits;
    }

    public void setCounterDigits(Integer counterDigits) {
        this.counterDigits = counterDigits;
    }

    public ResetPeriod getResetPeriod() {
        return resetPeriod;
    }

    public void setResetPeriod(ResetPeriod resetPeriod) {
        this.resetPeriod = resetPeriod;
    }

    public Integer getCurrentCounter() {
        return currentCounter;
    }

    public void setCurrentCounter(Integer currentCounter) {
        this.currentCounter = currentCounter;
    }

    public String getCurrentPeriod() {
        return currentPeriod;
    }

    public void setCurrentPeriod(String currentPeriod) {
        this.currentPeriod = currentPeriod;
    }

    public String getFormatPattern() {
        return formatPattern;
    }

    public void setFormatPattern(String formatPattern) {
        this.formatPattern = formatPattern;
    }

    public String getPreviewNumber() {
        return previewNumber;
    }

    public void setPreviewNumber(String previewNumber) {
        this.previewNumber = previewNumber;
    }

    public String getSamplePreview() {
        return previewNumber;
    }

    public void setSamplePreview(String samplePreview) {
        this.previewNumber = samplePreview;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
