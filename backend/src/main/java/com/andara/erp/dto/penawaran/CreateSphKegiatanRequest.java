package com.andara.erp.dto.penawaran;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

public class CreateSphKegiatanRequest {

    private Long id;

    @NotBlank(message = "Nama kegiatan SPH wajib diisi (misal: Pembangunan Ruang Kelas Baru)")
    @Size(max = 500, message = "Nama kegiatan SPH maksimal 500 karakter")
    private String name;

    private Integer sortOrder = 0;

    @NotEmpty(message = "Kegiatan SPH harus memiliki minimal 1 item pekerjaan")
    @Valid
    private List<CreatePenawaranDetailRequest> items = new ArrayList<>();

    public CreateSphKegiatanRequest() {
    }

    public CreateSphKegiatanRequest(String name, Integer sortOrder, List<CreatePenawaranDetailRequest> items) {
        this.name = name;
        this.sortOrder = sortOrder != null ? sortOrder : 0;
        this.items = items != null ? items : new ArrayList<>();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public List<CreatePenawaranDetailRequest> getItems() {
        return items;
    }

    public void setItems(List<CreatePenawaranDetailRequest> items) {
        this.items = items;
    }
}
