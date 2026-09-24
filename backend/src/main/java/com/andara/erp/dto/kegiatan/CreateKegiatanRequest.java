package com.andara.erp.dto.kegiatan;

import com.andara.erp.entity.KegiatanStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class CreateKegiatanRequest {

    @NotNull(message = "Customer wajib dipilih")
    private Long customerId;

    @NotBlank(message = "Kode kegiatan wajib diisi")
    @Size(max = 50, message = "Kode kegiatan maksimal 50 karakter")
    private String code;

    @NotBlank(message = "Nama kegiatan wajib diisi")
    @Size(max = 255, message = "Nama kegiatan maksimal 255 karakter")
    private String name;

    @Size(max = 255, message = "Lokasi kegiatan maksimal 255 karakter")
    private String location;

    private String description;

    private String notes;

    private KegiatanStatus status = KegiatanStatus.ACTIVE;

    @Valid
    private List<KegiatanItemRequest> items = new ArrayList<>();

    public CreateKegiatanRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
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

    public List<KegiatanItemRequest> getItems() {
        return items;
    }

    public void setItems(List<KegiatanItemRequest> items) {
        this.items = items;
    }
}
