package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class RekapKegiatanSummaryDTO {
    private Page<RekapKegiatanDTO> page;
    private long totalKegiatan;
    private BigDecimal grandTotalValue;

    public RekapKegiatanSummaryDTO() {
    }

    public RekapKegiatanSummaryDTO(Page<RekapKegiatanDTO> page, long totalKegiatan, BigDecimal grandTotalValue) {
        this.page = page;
        this.totalKegiatan = totalKegiatan;
        this.grandTotalValue = grandTotalValue;
    }

    public Page<RekapKegiatanDTO> getPage() { return page; }
    public void setPage(Page<RekapKegiatanDTO> page) { this.page = page; }
    public long getTotalKegiatan() { return totalKegiatan; }
    public void setTotalKegiatan(long totalKegiatan) { this.totalKegiatan = totalKegiatan; }
    public BigDecimal getGrandTotalValue() { return grandTotalValue; }
    public void setGrandTotalValue(BigDecimal grandTotalValue) { this.grandTotalValue = grandTotalValue; }
}
