package com.andara.erp.dto.penawaran;

import com.andara.erp.entity.SphKegiatan;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class SphKegiatanDTO {

    private Long id;
    private Long penawaranId;
    private String name;
    private Integer sortOrder;
    private BigDecimal subtotal;
    private List<PenawaranDetailDTO> items = new ArrayList<>();

    public SphKegiatanDTO() {
    }

    public static SphKegiatanDTO fromEntity(SphKegiatan entity) {
        if (entity == null) return null;

        SphKegiatanDTO dto = new SphKegiatanDTO();
        dto.setId(entity.getId());
        if (entity.getPenawaran() != null) {
            dto.setPenawaranId(entity.getPenawaran().getId());
        }
        dto.setName(entity.getName());
        dto.setSortOrder(entity.getSortOrder());
        dto.setSubtotal(entity.getSubtotal());

        if (entity.getItems() != null) {
            dto.setItems(entity.getItems().stream()
                    .map(PenawaranDetailDTO::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPenawaranId() {
        return penawaranId;
    }

    public void setPenawaranId(Long penawaranId) {
        this.penawaranId = penawaranId;
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

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public List<PenawaranDetailDTO> getItems() {
        return items;
    }

    public void setItems(List<PenawaranDetailDTO> items) {
        this.items = items;
    }
}
