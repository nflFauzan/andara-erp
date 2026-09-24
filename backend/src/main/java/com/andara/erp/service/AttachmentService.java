package com.andara.erp.service;

import com.andara.erp.common.exception.AppException;
import com.andara.erp.common.exception.ErrorCode;
import com.andara.erp.dto.attachment.AttachmentDTO;
import com.andara.erp.entity.Attachment;
import com.andara.erp.repository.AttachmentRepository;
import com.andara.erp.service.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AttachmentService {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",
            "application/vnd.ms-excel"
    );

    private final AttachmentRepository attachmentRepository;
    private final StorageService storageService;

    public AttachmentService(AttachmentRepository attachmentRepository, StorageService storageService) {
        this.attachmentRepository = attachmentRepository;
        this.storageService = storageService;
    }

    @Transactional
    public AttachmentDTO uploadAttachment(String referenceType, Long referenceId, MultipartFile file, String currentUsername) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "File lampiran tidak boleh kosong");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Ukuran file melebihi batas maksimal 10MB");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Tipe file tidak diizinkan. Gunakan PDF, Gambar (JPEG/PNG/WEBP), atau Dokumen Office.");
        }

        try {
            String checksum = storageService.calculateChecksum(file);
            String folder = referenceType.trim().toLowerCase();
            String objectKey = storageService.store(file, folder);

            Attachment attachment = new Attachment(
                    referenceType.trim().toUpperCase(),
                    referenceId,
                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file",
                    objectKey,
                    contentType != null ? contentType : "application/octet-stream",
                    file.getSize(),
                    checksum,
                    currentUsername
            );

            Attachment saved = attachmentRepository.save(attachment);
            return AttachmentDTO.fromEntity(saved);
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Gagal mengunggah file lampiran: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<AttachmentDTO> getAttachmentsByReference(String referenceType, Long referenceId) {
        return attachmentRepository.findByReferenceTypeAndReferenceIdOrderByCreatedAtDesc(referenceType.toUpperCase(), referenceId)
                .stream()
                .map(AttachmentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentEntity(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Lampiran tidak ditemukan dengan ID: " + id));
    }

    @Transactional(readOnly = true)
    public byte[] downloadAttachment(Long id) {
        Attachment attachment = getAttachmentEntity(id);
        try {
            return storageService.load(attachment.getObjectKey());
        } catch (IOException e) {
            throw new AppException(ErrorCode.NOT_FOUND, "File tidak dapat dibaca dari storage: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteAttachment(Long id) {
        Attachment attachment = getAttachmentEntity(id);
        try {
            storageService.delete(attachment.getObjectKey());
        } catch (IOException ignored) {
        }
        attachmentRepository.delete(attachment);
    }
}
