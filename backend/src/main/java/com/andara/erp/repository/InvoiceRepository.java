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

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByNumber(String number);

    boolean existsByNumber(String number);

    List<Invoice> findByCustomerIdOrderByDateDesc(Long customerId);

    List<Invoice> findBySourcePenawaranId(Long sourcePenawaranId);

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
}
