package com.andara.erp.dto.numbering;

import com.andara.erp.entity.ResetPeriod;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateNumberingRequest {

    @NotBlank(message = "Prefix nomor wajib diisi")
    @Size(max = 20, message = "Prefix maksimal 20 karakter")
    private String prefix;

    @Size(max = 20, message = "Suffix maksimal 20 karakter")
    private String suffix = "";

    @NotNull(message = "Jumlah digit counter wajib diisi")
    @Min(value = 1, message = "Minimal 1 digit")
    @Max(value = 10, message = "Maksimal 10 digit")
    private Integer counterDigits = 4;

    @NotNull(message = "Periode reset wajib dipilih")
    private ResetPeriod resetPeriod = ResetPeriod.MONTHLY;

    @NotBlank(message = "Format pola penomoran wajib diisi")
    @Size(max = 100, message = "Format pattern maksimal 100 karakter")
    private String formatPattern = "{PREFIX}/{YEAR}/{MONTH}/{COUNTER}";

    public UpdateNumberingRequest() {
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

    public String getFormatPattern() {
        return formatPattern;
    }

    public void setFormatPattern(String formatPattern) {
        this.formatPattern = formatPattern;
    }
}
