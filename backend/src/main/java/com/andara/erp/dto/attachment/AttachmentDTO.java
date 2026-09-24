package com.andara.erp.dto.attachment;

import com.andara.erp.entity.Attachment;

import java.time.OffsetDateTime;

public class AttachmentDTO {

    private Long id;
    private String referenceType;
    private Long referenceId;
    private String originalFilename;
    private String objectKey;
    private String contentType;
    private Long sizeBytes;
    private String checksum;
    private OffsetDateTime createdAt;
    private String createdBy;
    private String downloadUrl;

    public AttachmentDTO() {
    }

    public static AttachmentDTO fromEntity(Attachment attachment) {
        AttachmentDTO dto = new AttachmentDTO();
        dto.setId(attachment.getId());
        dto.setReferenceType(attachment.getReferenceType());
        dto.setReferenceId(attachment.getReferenceId());
        dto.setOriginalFilename(attachment.getOriginalFilename());
        dto.setObjectKey(attachment.getObjectKey());
        dto.setContentType(attachment.getContentType());
        dto.setSizeBytes(attachment.getSizeBytes());
        dto.setChecksum(attachment.getChecksum());
        dto.setCreatedAt(attachment.getCreatedAt());
        dto.setCreatedBy(attachment.getCreatedBy());
        dto.setDownloadUrl("/api/attachments/" + attachment.getId() + "/download");
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getSizeBytes() {
        return sizeBytes;
    }

    public void setSizeBytes(Long sizeBytes) {
        this.sizeBytes = sizeBytes;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getDownloadUrl() {
        return downloadUrl;
    }

    public void setDownloadUrl(String downloadUrl) {
        this.downloadUrl = downloadUrl;
    }
}
