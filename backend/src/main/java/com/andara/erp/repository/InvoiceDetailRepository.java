package com.andara.erp.repository;

import com.andara.erp.entity.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail, Long> {

    List<InvoiceDetail> findByInvoiceIdOrderBySortOrderAscIdAsc(Long invoiceId);

    List<InvoiceDetail> findBySourcePenawaranDetailId(Long sourcePenawaranDetailId);

    @Query("SELECT COALESCE(SUM(d.quantity), 0) FROM InvoiceDetail d " +
            "WHERE d.sourcePenawaranDetail.id = :penawaranDetailId " +
            "AND d.invoice.status != com.andara.erp.entity.InvoiceStatus.CANCELLED " +
            "AND (:excludeInvoiceId IS NULL OR d.invoice.id != :excludeInvoiceId)")
    BigDecimal sumBilledQuantityBySourcePenawaranDetailId(
            @Param("penawaranDetailId") Long penawaranDetailId,
            @Param("excludeInvoiceId") Long excludeInvoiceId
    );

    @Query("SELECT DISTINCT d.invoice FROM InvoiceDetail d " +
            "WHERE (d.sourceKegiatan.id = :kegiatanId " +
            "   OR (d.sourcePenawaranDetail IS NOT NULL AND d.sourcePenawaranDetail.kegiatan.id = :kegiatanId) " +
            "   OR (d.sourcePenawaranDetail IS NOT NULL AND d.sourcePenawaranDetail.sphKegiatan IS NOT NULL AND d.sourcePenawaranDetail.sphKegiatan.kegiatan.id = :kegiatanId) " +
            "   OR (d.sphKegiatan IS NOT NULL AND d.sphKegiatan.kegiatan.id = :kegiatanId)) " +
            "ORDER BY d.invoice.date DESC")
    List<com.andara.erp.entity.Invoice> findInvoicesByKegiatanId(@Param("kegiatanId") Long kegiatanId);
}
