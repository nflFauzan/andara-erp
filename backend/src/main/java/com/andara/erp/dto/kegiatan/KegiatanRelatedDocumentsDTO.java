package com.andara.erp.dto.kegiatan;

import com.andara.erp.dto.invoice.InvoiceDTO;
import com.andara.erp.dto.penawaran.PenawaranDTO;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class KegiatanRelatedDocumentsDTO {

    private Long kegiatanId;
    private String kegiatanCode;
    private String kegiatanName;
    private BigDecimal totalKegiatanAmount = BigDecimal.ZERO;

    private List<PenawaranDTO> penawaranList = new ArrayList<>();
    private List<InvoiceDTO> invoiceList = new ArrayList<>();

    private BigDecimal totalSphAmount = BigDecimal.ZERO;
    private BigDecimal totalInvoicedAmount = BigDecimal.ZERO;
    private BigDecimal totalPaidAmount = BigDecimal.ZERO;
    private BigDecimal totalOutstanding = BigDecimal.ZERO;

    public KegiatanRelatedDocumentsDTO() {
    }

    public Long getKegiatanId() {
        return kegiatanId;
    }

    public void setKegiatanId(Long kegiatanId) {
        this.kegiatanId = kegiatanId;
    }

    public String getKegiatanCode() {
        return kegiatanCode;
    }

    public void setKegiatanCode(String kegiatanCode) {
        this.kegiatanCode = kegiatanCode;
    }

    public String getKegiatanName() {
        return kegiatanName;
    }

    public void setKegiatanName(String kegiatanName) {
        this.kegiatanName = kegiatanName;
    }

    public BigDecimal getTotalKegiatanAmount() {
        return totalKegiatanAmount;
    }

    public void setTotalKegiatanAmount(BigDecimal totalKegiatanAmount) {
        this.totalKegiatanAmount = totalKegiatanAmount;
    }

    public List<PenawaranDTO> getPenawaranList() {
        return penawaranList;
    }

    public void setPenawaranList(List<PenawaranDTO> penawaranList) {
        this.penawaranList = penawaranList;
    }

    public List<InvoiceDTO> getInvoiceList() {
        return invoiceList;
    }

    public void setInvoiceList(List<InvoiceDTO> invoiceList) {
        this.invoiceList = invoiceList;
    }

    public BigDecimal getTotalSphAmount() {
        return totalSphAmount;
    }

    public void setTotalSphAmount(BigDecimal totalSphAmount) {
        this.totalSphAmount = totalSphAmount;
    }

    public BigDecimal getTotalInvoicedAmount() {
        return totalInvoicedAmount;
    }

    public void setTotalInvoicedAmount(BigDecimal totalInvoicedAmount) {
        this.totalInvoicedAmount = totalInvoicedAmount;
    }

    public BigDecimal getTotalPaidAmount() {
        return totalPaidAmount;
    }

    public void setTotalPaidAmount(BigDecimal totalPaidAmount) {
        this.totalPaidAmount = totalPaidAmount;
    }

    public BigDecimal getTotalOutstanding() {
        return totalOutstanding;
    }

    public void setTotalOutstanding(BigDecimal totalOutstanding) {
        this.totalOutstanding = totalOutstanding;
    }
}
