package com.andara.erp.dto.numbering;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class PreviewNumberingRequest {

    @NotBlank(message = "Prefix wajib diisi")
    @Size(max = 20)
    private String prefix;

    @Size(max = 20)
    private String suffix = "";

    @NotNull
    @Min(1)
    @Max(10)
    private Integer counterDigits = 4;

    @NotBlank(message = "Format pattern wajib diisi")
    @Size(max = 100)
    private String formatPattern = "{PREFIX}/{YEAR}/{MONTH}/{COUNTER}";

    public PreviewNumberingRequest() {
    }

    public PreviewNumberingRequest(String prefix, String suffix, Integer counterDigits, String formatPattern) {
        this.prefix = prefix;
        this.suffix = suffix;
        this.counterDigits = counterDigits;
        this.formatPattern = formatPattern;
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

    public String getFormatPattern() {
        return formatPattern;
    }

    public void setFormatPattern(String formatPattern) {
        this.formatPattern = formatPattern;
    }
}
