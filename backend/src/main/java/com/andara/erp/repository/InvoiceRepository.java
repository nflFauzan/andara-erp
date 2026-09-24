package com.andara.erp.repository;

import com.andara.erp.entity.Invoice;
import com.andara.erp.entity.InvoicePaymentStatus;
import com.andara.erp.entity.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByNumber(String number);

    boolean existsByNumber(String number);

    List<Invoice> findByCustomerIdOrderByDateDesc(Long customerId);

    List<Invoice> findBySourcePenawaranId(Long sourcePenawaranId);

    long countByCustomerId(Long customerId);

    @Query("SELECT COUNT(inv) FROM Invoice inv WHERE inv.status != 'CANCELLED' AND inv.date BETWEEN :startDate AND :endDate")
    long countActiveByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(inv) FROM Invoice inv WHERE inv.customer.id = :customerId AND inv.status != 'CANCELLED' AND inv.date BETWEEN :startDate AND :endDate")
    long countActiveByCustomerIdAndDateRange(@Param("customerId") Long customerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(inv.totalAmount), 0) FROM Invoice inv WHERE inv.status != 'CANCELLED' AND inv.date BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalAmountActiveByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(inv.totalAmount), 0) FROM Invoice inv WHERE inv.customer.id = :customerId AND inv.status != 'CANCELLED' AND inv.date BETWEEN :startDate AND :endDate")
    BigDecimal sumTotalAmountActiveByCustomerIdAndDateRange(@Param("customerId") Long customerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(inv.totalAmount - inv.paidAmount), 0) FROM Invoice inv WHERE inv.status != 'CANCELLED' AND inv.paymentStatus != 'PAID' AND inv.date BETWEEN :startDate AND :endDate")
    BigDecimal sumOutstandingActiveByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(inv.totalAmount - inv.paidAmount), 0) FROM Invoice inv WHERE inv.customer.id = :customerId AND inv.status != 'CANCELLED' AND inv.paymentStatus != 'PAID' AND inv.date BETWEEN :startDate AND :endDate")
    BigDecimal sumOutstandingActiveByCustomerIdAndDateRange(@Param("customerId") Long customerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(inv) FROM Invoice inv WHERE inv.status != 'CANCELLED' AND inv.paymentStatus != 'PAID' AND inv.date BETWEEN :startDate AND :endDate")
    long countUnpaidActiveByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COUNT(inv) FROM Invoice inv WHERE inv.customer.id = :customerId AND inv.status != 'CANCELLED' AND inv.paymentStatus != 'PAID' AND inv.date BETWEEN :startDate AND :endDate")
    long countUnpaidActiveByCustomerIdAndDateRange(@Param("customerId") Long customerId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT inv FROM Invoice inv JOIN FETCH inv.customer c WHERE inv.status != 'CANCELLED' AND inv.paymentStatus != 'PAID' ORDER BY inv.dueDate ASC NULLS LAST, inv.date DESC")
    List<Invoice> findRecentUnpaidInvoices(Pageable pageable);

    @Query("SELECT inv FROM Invoice inv JOIN FETCH inv.customer c WHERE inv.customer.id = :customerId AND inv.status != 'CANCELLED' AND inv.paymentStatus != 'PAID' ORDER BY inv.dueDate ASC NULLS LAST, inv.date DESC")
    List<Invoice> findRecentUnpaidInvoicesByCustomerId(@Param("customerId") Long customerId, Pageable pageable);

    @Query("SELECT inv FROM Invoice inv " +
            "JOIN inv.customer c " +
            "WHERE (:customerId IS NULL OR inv.customer.id = :customerId) " +
            "AND (:status IS NULL OR inv.status = :status) " +
            "AND (:paymentStatus IS NULL OR inv.paymentStatus = :paymentStatus) " +
            "AND (:startDate IS NULL OR inv.date >= :startDate) " +
            "AND (:endDate IS NULL OR inv.date <= :endDate) " +
            "AND (:searchPattern IS NULL OR (" +
            "   LOWER(inv.number) LIKE :searchPattern OR " +
            "   LOWER(c.name) LIKE :searchPattern OR " +
            "   LOWER(c.code) LIKE :searchPattern OR " +
            "   LOWER(inv.notes) LIKE :searchPattern" +
            "))")
    Page<Invoice> findWithFilters(
            @Param("searchPattern") String searchPattern,
            @Param("customerId") Long customerId,
            @Param("status") InvoiceStatus status,
            @Param("paymentStatus") InvoicePaymentStatus paymentStatus,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT inv FROM Invoice inv WHERE inv.id = :id")
    Optional<Invoice> findByIdForUpdate(@Param("id") Long id);
}
