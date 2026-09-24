package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.numbering.*;
import com.andara.erp.entity.DocumentType;
import com.andara.erp.entity.NumberingConfiguration;
import com.andara.erp.entity.ResetPeriod;
import com.andara.erp.repository.NumberingConfigurationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NumberingService {

    private final NumberingConfigurationRepository numberingRepository;

    public NumberingService(NumberingConfigurationRepository numberingRepository) {
        this.numberingRepository = numberingRepository;
    }

    @Transactional(readOnly = true)
    public List<NumberingConfigurationDTO> getAllConfigurations() {
        LocalDate today = LocalDate.now();
        return numberingRepository.findAll().stream()
                .map(config -> {
                    String preview = renderNumber(
                            config.getFormatPattern(),
                            config.getPrefix(),
                            config.getSuffix(),
                            config.getCounterDigits(),
                            config.getCurrentCounter() + 1,
                            today
                    );
                    return NumberingConfigurationDTO.fromEntity(config, preview);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NumberingConfigurationDTO getConfiguration(DocumentType documentType) {
        NumberingConfiguration config = numberingRepository.findByDocumentType(documentType)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Konfigurasi penomoran untuk " + documentType + " tidak ditemukan"));

        String preview = renderNumber(
                config.getFormatPattern(),
                config.getPrefix(),
                config.getSuffix(),
                config.getCounterDigits(),
                config.getCurrentCounter() + 1,
                LocalDate.now()
        );
        return NumberingConfigurationDTO.fromEntity(config, preview);
    }

    @Transactional
    public NumberingConfigurationDTO updateConfiguration(DocumentType documentType, UpdateNumberingRequest request) {
        NumberingConfiguration config = numberingRepository.findByDocumentType(documentType)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Konfigurasi penomoran untuk " + documentType + " tidak ditemukan"));

        config.setPrefix(request.getPrefix().trim());
        config.setSuffix(request.getSuffix() != null ? request.getSuffix().trim() : "");
        config.setCounterDigits(request.getCounterDigits());
        config.setResetPeriod(request.getResetPeriod());
        config.setFormatPattern(request.getFormatPattern().trim());
        config.setUpdatedAt(OffsetDateTime.now());

        NumberingConfiguration saved = numberingRepository.save(config);

        String preview = renderNumber(
                saved.getFormatPattern(),
                saved.getPrefix(),
                saved.getSuffix(),
                saved.getCounterDigits(),
                saved.getCurrentCounter() + 1,
                LocalDate.now()
        );
        return NumberingConfigurationDTO.fromEntity(saved, preview);
    }

    /**
     * Concurrency-safe number generation using PostgreSQL row-level pessimistic lock (SELECT ... FOR UPDATE).
     */
    @Transactional
    public String generateNextNumber(DocumentType documentType, LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        NumberingConfiguration config = numberingRepository.findByDocumentTypeWithLock(documentType)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Konfigurasi penomoran untuk " + documentType + " tidak ditemukan"));

        String targetPeriod = determinePeriod(config.getResetPeriod(), date);

        if (!targetPeriod.equals(config.getCurrentPeriod())) {
            config.setCurrentPeriod(targetPeriod);
            config.setCurrentCounter(1);
        } else {
            config.setCurrentCounter(config.getCurrentCounter() + 1);
        }

        config.setUpdatedAt(OffsetDateTime.now());
        numberingRepository.save(config);

        return renderNumber(
                config.getFormatPattern(),
                config.getPrefix(),
                config.getSuffix(),
                config.getCounterDigits(),
                config.getCurrentCounter(),
                date
        );
    }

    public PreviewNumberingResponse preview(PreviewNumberingRequest request) {
        LocalDate today = LocalDate.now();
        int sampleCounter = 1;
        String previewNumber = renderNumber(
                request.getFormatPattern(),
                request.getPrefix(),
                request.getSuffix() != null ? request.getSuffix() : "",
                request.getCounterDigits() != null ? request.getCounterDigits() : 4,
                sampleCounter,
                today
        );
        return new PreviewNumberingResponse(previewNumber, request.getFormatPattern(), sampleCounter);
    }

    public String renderNumber(
            String pattern,
            String prefix,
            String suffix,
            int counterDigits,
            int counter,
            LocalDate date
    ) {
        if (pattern == null || pattern.trim().isEmpty()) {
            pattern = "{PREFIX}/{YEAR}/{MONTH}/{COUNTER}";
        }

        String paddedCounter = String.format("%0" + counterDigits + "d", counter);
        String year4 = String.valueOf(date.getYear());
        String year2 = String.format("%02d", date.getYear() % 100);
        String month2 = String.format("%02d", date.getMonthValue());
        String day2 = String.format("%02d", date.getDayOfMonth());

        return pattern
                .replace("{PREFIX}", prefix != null ? prefix : "")
                .replace("{SUFFIX}", suffix != null ? suffix : "")
                .replace("{YEAR}", year4)
                .replace("{YYYY}", year4)
                .replace("{YY}", year2)
                .replace("{MONTH}", month2)
                .replace("{MM}", month2)
                .replace("{DAY}", day2)
                .replace("{DD}", day2)
                .replace("{COUNTER}", paddedCounter);
    }

    private String determinePeriod(ResetPeriod resetPeriod, LocalDate date) {
        if (resetPeriod == null) {
            return "";
        }
        return switch (resetPeriod) {
            case MONTHLY -> date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            case YEARLY -> date.format(DateTimeFormatter.ofPattern("yyyy"));
            case NEVER -> "";
        };
    }
}
