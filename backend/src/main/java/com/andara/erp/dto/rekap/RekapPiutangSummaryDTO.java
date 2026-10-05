package com.andara.erp.dto.rekap;

import org.springframework.data.domain.Page;
import java.math.BigDecimal;

public class RekapPiutangSummaryDTO {
    private Page<RekapPiutangDTO> page;
    private long totalInvoicesWithOutstanding;
    private BigDecimal grandTotalOutstanding;
    private BigDecimal currentAmount;
    private long currentCount;
    private BigDecimal overdueAmount;
    private long overdueCount;
    private BigDecimal bucket1To30Amount;
    private long bucket1To30Count;
    private BigDecimal bucket31To60Amount;
    private long bucket31To60Count;
    private BigDecimal bucket61To90Amount;
    private long bucket61To90Count;
    private BigDecimal bucketOver90Amount;
    private long bucketOver90Count;

    public RekapPiutangSummaryDTO() {
    }

    public RekapPiutangSummaryDTO(Page<RekapPiutangDTO> page, long totalInvoicesWithOutstanding,
                                 BigDecimal grandTotalOutstanding, BigDecimal currentAmount,
                                 long currentCount, BigDecimal overdueAmount, long overdueCount,
                                 BigDecimal bucket1To30Amount, long bucket1To30Count,
                                 BigDecimal bucket31To60Amount, long bucket31To60Count,
                                 BigDecimal bucket61To90Amount, long bucket61To90Count,
                                 BigDecimal bucketOver90Amount, long bucketOver90Count) {
        this.page = page;
        this.totalInvoicesWithOutstanding = totalInvoicesWithOutstanding;
        this.grandTotalOutstanding = grandTotalOutstanding;
        this.currentAmount = currentAmount;
        this.currentCount = currentCount;
        this.overdueAmount = overdueAmount;
        this.overdueCount = overdueCount;
        this.bucket1To30Amount = bucket1To30Amount;
        this.bucket1To30Count = bucket1To30Count;
        this.bucket31To60Amount = bucket31To60Amount;
        this.bucket31To60Count = bucket31To60Count;
        this.bucket61To90Amount = bucket61To90Amount;
        this.bucket61To90Count = bucket61To90Count;
        this.bucketOver90Amount = bucketOver90Amount;
        this.bucketOver90Count = bucketOver90Count;
    }

    public Page<RekapPiutangDTO> getPage() { return page; }
    public void setPage(Page<RekapPiutangDTO> page) { this.page = page; }
    public long getTotalInvoicesWithOutstanding() { return totalInvoicesWithOutstanding; }
    public void setTotalInvoicesWithOutstanding(long totalInvoicesWithOutstanding) { this.totalInvoicesWithOutstanding = totalInvoicesWithOutstanding; }
    public BigDecimal getGrandTotalOutstanding() { return grandTotalOutstanding; }
    public void setGrandTotalOutstanding(BigDecimal grandTotalOutstanding) { this.grandTotalOutstanding = grandTotalOutstanding; }
    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }
    public long getCurrentCount() { return currentCount; }
    public void setCurrentCount(long currentCount) { this.currentCount = currentCount; }
    public BigDecimal getOverdueAmount() { return overdueAmount; }
    public void setOverdueAmount(BigDecimal overdueAmount) { this.overdueAmount = overdueAmount; }
    public long getOverdueCount() { return overdueCount; }
    public void setOverdueCount(long overdueCount) { this.overdueCount = overdueCount; }
    public BigDecimal getBucket1To30Amount() { return bucket1To30Amount; }
    public void setBucket1To30Amount(BigDecimal bucket1To30Amount) { this.bucket1To30Amount = bucket1To30Amount; }
    public long getBucket1To30Count() { return bucket1To30Count; }
    public void setBucket1To30Count(long bucket1To30Count) { this.bucket1To30Count = bucket1To30Count; }
    public BigDecimal getBucket31To60Amount() { return bucket31To60Amount; }
    public void setBucket31To60Amount(BigDecimal bucket31To60Amount) { this.bucket31To60Amount = bucket31To60Amount; }
    public long getBucket31To60Count() { return bucket31To60Count; }
    public void setBucket31To60Count(long bucket31To60Count) { this.bucket31To60Count = bucket31To60Count; }
    public BigDecimal getBucket61To90Amount() { return bucket61To90Amount; }
    public void setBucket61To90Amount(BigDecimal bucket61To90Amount) { this.bucket61To90Amount = bucket61To90Amount; }
    public long getBucket61To90Count() { return bucket61To90Count; }
    public void setBucket61To90Count(long bucket61To90Count) { this.bucket61To90Count = bucket61To90Count; }
    public BigDecimal getBucketOver90Amount() { return bucketOver90Amount; }
    public void setBucketOver90Amount(BigDecimal bucketOver90Amount) { this.bucketOver90Amount = bucketOver90Amount; }
    public long getBucketOver90Count() { return bucketOver90Count; }
    public void setBucketOver90Count(long bucketOver90Count) { this.bucketOver90Count = bucketOver90Count; }
}
