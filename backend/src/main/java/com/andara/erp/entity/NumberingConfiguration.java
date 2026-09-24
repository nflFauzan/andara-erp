package com.andara.erp.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "numbering_configurations")
public class NumberingConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, unique = true, length = 50)
    private DocumentType documentType;

    @Column(nullable = false, length = 20)
    private String prefix;

    @Column(length = 20)
    private String suffix = "";

    @Column(name = "counter_digits", nullable = false)
    private Integer counterDigits = 4;

    @Enumerated(EnumType.STRING)
    @Column(name = "reset_period", nullable = false, length = 20)
    private ResetPeriod resetPeriod = ResetPeriod.MONTHLY;

    @Column(name = "current_counter", nullable = false)
    private Integer currentCounter = 0;

    @Column(name = "current_period", nullable = false, length = 20)
    private String currentPeriod = "";

    @Column(name = "format_pattern", nullable = false, length = 100)
    private String formatPattern = "{PREFIX}/{YEAR}/{MONTH}/{COUNTER}";

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public NumberingConfiguration() {
    }

    @PrePersist
    protected void onCreate() {
        if (updatedAt == null) {
            updatedAt = OffsetDateTime.now();
        }
        if (suffix == null) {
            suffix = "";
        }
        if (currentPeriod == null) {
            currentPeriod = "";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
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

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
