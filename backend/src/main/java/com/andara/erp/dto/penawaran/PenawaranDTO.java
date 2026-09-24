package com.andara.erp.dto.penawaran;

import com.andara.erp.entity.Penawaran;
import com.andara.erp.entity.PenawaranStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class PenawaranDTO {

    private Long id;
    private String number;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private LocalDate date;
    private PenawaranStatus status;
    private String statusLabel;
    private String notes;
    private String terms;
    private BigDecimal totalAmount;
    private Integer itemCount;
    private List<PenawaranDetailDTO> details = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    public PenawaranDTO() {
    }

    public static PenawaranDTO fromEntity(Penawaran entity) {
        return fromEntity(entity, true);
    }

    public static PenawaranDTO fromEntity(Penawaran entity, boolean includeDetails) {
        PenawaranDTO dto = new PenawaranDTO();
        dto.setId(entity.getId());
        dto.setNumber(entity.getNumber());
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
            dto.setCustomerCode(entity.getCustomer().getCode());
            dto.setCustomerName(entity.getCustomer().getName());
        }
        dto.setDate(entity.getDate());
        dto.setStatus(entity.getStatus());
        dto.setStatusLabel(entity.getStatus() != null ? entity.getStatus().getLabel() : "");
        dto.setNotes(entity.getNotes());
        dto.setTerms(entity.getTerms());
        dto.setTotalAmount(entity.getTotalAmount());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());

        if (entity.getDetails() != null) {
            dto.setItemCount(entity.getDetails().size());
            if (includeDetails) {
                dto.setDetails(entity.getDetails().stream()
                        .map(PenawaranDetailDTO::fromEntity)
                        .collect(Collectors.toList()));
            }
        } else {
            dto.setItemCount(0);
        }

        return dto;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerCode() {
        return customerCode;
    }

    public void setCustomerCode(String customerCode) {
        this.customerCode = customerCode;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public PenawaranStatus getStatus() {
        return status;
    }

    public void setStatus(PenawaranStatus status) {
        this.status = status;
    }

    public String getStatusLabel() {
        return statusLabel;
    }

    public void setStatusLabel(String statusLabel) {
        this.statusLabel = statusLabel;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getTerms() {
        return terms;
    }

    public void setTerms(String terms) {
        this.terms = terms;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getItemCount() {
        return itemCount;
    }

    public void setItemCount(Integer itemCount) {
        this.itemCount = itemCount;
    }

    public List<PenawaranDetailDTO> getDetails() {
        return details;
    }

    public void setDetails(List<PenawaranDetailDTO> details) {
        this.details = details;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}
