package com.andara.erp.dto.numbering;

public class PreviewNumberingResponse {

    private String previewNumber;
    private String formatPattern;
    private int simulatedCounter;

    public PreviewNumberingResponse() {
    }

    public PreviewNumberingResponse(String previewNumber, String formatPattern, int simulatedCounter) {
        this.previewNumber = previewNumber;
        this.formatPattern = formatPattern;
        this.simulatedCounter = simulatedCounter;
    }

    public String getPreviewNumber() {
        return previewNumber;
    }

    public void setPreviewNumber(String previewNumber) {
        this.previewNumber = previewNumber;
    }

    public String getFormatPattern() {
        return formatPattern;
    }

    public void setFormatPattern(String formatPattern) {
        this.formatPattern = formatPattern;
    }

    public int getSimulatedCounter() {
        return simulatedCounter;
    }

    public void setSimulatedCounter(int simulatedCounter) {
        this.simulatedCounter = simulatedCounter;
    }
}
