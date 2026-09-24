package com.andara.erp.dto.kegiatan;

import com.andara.erp.entity.Kegiatan;
import com.andara.erp.entity.KegiatanStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class KegiatanDTO {

    private Long id;
    private String code;
    private String name;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private String customerCompanyName;
    private String location;
    private String description;
    private String notes;
    private KegiatanStatus status;
    private BigDecimal totalAmount;
    private int itemsCount;
    private List<KegiatanItemDTO> items = new ArrayList<>();
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    public KegiatanDTO() {
    }

    public static KegiatanDTO fromEntity(Kegiatan k, boolean includeItems) {
        KegiatanDTO dto = new KegiatanDTO();
        dto.setId(k.getId());
        dto.setCode(k.getCode());
        dto.setName(k.getName());
        if (k.getCustomer() != null) {
            dto.setCustomerId(k.getCustomer().getId());
            dto.setCustomerCode(k.getCustomer().getCode());
            dto.setCustomerName(k.getCustomer().getName());
            dto.setCustomerCompanyName(k.getCustomer().getCompanyName());
        }
        dto.setLocation(k.getLocation());
        dto.setDescription(k.getDescription());
        dto.setNotes(k.getNotes());
        dto.setStatus(k.getStatus());
        dto.setTotalAmount(k.getTotalAmount());
        dto.setItemsCount(k.getItems() != null ? k.getItems().size() : 0);
        if (includeItems && k.getItems() != null) {
            dto.setItems(k.getItems().stream()
                    .map(KegiatanItemDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        dto.setCreatedAt(k.getCreatedAt());
        dto.setUpdatedAt(k.getUpdatedAt());
        dto.setCreatedBy(k.getCreatedBy());
        dto.setUpdatedBy(k.getUpdatedBy());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getCustomerCompanyName() {
        return customerCompanyName;
    }

    public void setCustomerCompanyName(String customerCompanyName) {
        this.customerCompanyName = customerCompanyName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public KegiatanStatus getStatus() {
        return status;
    }

    public void setStatus(KegiatanStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public int getItemsCount() {
        return itemsCount;
    }

    public void setItemsCount(int itemsCount) {
        this.itemsCount = itemsCount;
    }

    public List<KegiatanItemDTO> getItems() {
        return items;
    }

    public void setItems(List<KegiatanItemDTO> items) {
        this.items = items;
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
