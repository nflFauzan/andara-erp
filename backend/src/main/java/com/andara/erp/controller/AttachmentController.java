package com.andara.erp.controller;

import com.andara.erp.common.dto.ApiResponse;
import com.andara.erp.dto.attachment.AttachmentDTO;
import com.andara.erp.entity.Attachment;
import com.andara.erp.service.AttachmentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<AttachmentDTO>> uploadAttachment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("referenceType") String referenceType,
            @RequestParam("referenceId") Long referenceId,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        AttachmentDTO uploaded = attachmentService.uploadAttachment(referenceType, referenceId, file, username);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(uploaded, "File berhasil diunggah"));
    }

    @GetMapping("/reference/{referenceType}/{referenceId}")
    public ApiResponse<List<AttachmentDTO>> getAttachmentsByReference(
            @PathVariable String referenceType,
            @PathVariable Long referenceId
    ) {
        List<AttachmentDTO> attachments = attachmentService.getAttachmentsByReference(referenceType, referenceId);
        return ApiResponse.success(attachments);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadAttachment(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachmentEntity(id);
        byte[] data = attachmentService.downloadAttachment(id);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(attachment.getContentType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
                .body(data);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ApiResponse.success(null, "Lampiran berhasil dihapus");
    }
}
