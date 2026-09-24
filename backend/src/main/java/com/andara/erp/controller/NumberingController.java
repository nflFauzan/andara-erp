package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.numbering.*;
import com.andara.erp.entity.DocumentType;
import com.andara.erp.service.NumberingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/numbering")
public class NumberingController {

    private final NumberingService numberingService;

    public NumberingController(NumberingService numberingService) {
        this.numberingService = numberingService;
    }

    @GetMapping
    public ApiResponse<List<NumberingConfigurationDTO>> getAllConfigurations() {
        List<NumberingConfigurationDTO> list = numberingService.getAllConfigurations();
        return ApiResponse.success(list);
    }

    @GetMapping("/{documentType}")
    public ApiResponse<NumberingConfigurationDTO> getConfiguration(@PathVariable DocumentType documentType) {
        NumberingConfigurationDTO dto = numberingService.getConfiguration(documentType);
        return ApiResponse.success(dto);
    }

    @PutMapping("/{documentType}")
    public ApiResponse<NumberingConfigurationDTO> updateConfiguration(
            @PathVariable DocumentType documentType,
            @Valid @RequestBody UpdateNumberingRequest request
    ) {
        NumberingConfigurationDTO updated = numberingService.updateConfiguration(documentType, request);
        return ApiResponse.success(updated, "Format penomoran untuk " + documentType + " berhasil diperbarui");
    }

    @PostMapping("/preview")
    public ApiResponse<PreviewNumberingResponse> previewNumbering(@Valid @RequestBody PreviewNumberingRequest request) {
        PreviewNumberingResponse response = numberingService.preview(request);
        return ApiResponse.success(response);
    }

    @PostMapping("/generate/{documentType}")
    public ApiResponse<String> generateNextNumber(@PathVariable DocumentType documentType) {
        String generated = numberingService.generateNextNumber(documentType, LocalDate.now());
        return ApiResponse.success(generated, "Nomor dokumen berhasil digenerate");
    }
}
